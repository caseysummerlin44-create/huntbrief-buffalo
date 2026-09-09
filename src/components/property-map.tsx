import {
  FARM_DEED_ACRES,
  loadLockedPins,
  resetLockedPins,
  saveLockedPins,
} from "@/data/property";
import {
  DEFAULT_SIGN_COLOR,
  DEFAULT_STAND_COLOR,
  MARK_COLORS,
  SEEDED_STANDS,
  loadMarks,
  newMark,
  saveMarks,
  type MapMark,
  type MarkKind,
} from "@/data/marks";
import { StandIntelCard } from "@/components/stand-intel-card";
import { OnxPanel } from "@/components/onx-panel";
import { loadFarmMarks, recommendedMarks } from "@/data/farm-terrain";
import { scoreStand } from "@/data/stand-intel";
import { clipOverlays, loadOverlays, saveOverlays, type MapOverlay } from "@/data/overlays";
import {
  downloadText,
  mergeMarkup,
  parseMarkupFile,
  sampleMarkupForFarm,
  toGpx,
  toKml,
  type ImportResult,
} from "@/lib/gpx-kml";
import { useFarm } from "@/lib/farm-context";
import { schedulePush } from "@/lib/persist-client";
import { useWeather } from "@/lib/weather-context";
import { LAYERS, attachEsriImage } from "@/lib/esri-image";
import { type ParcelGeometry, type ParcelProps } from "@/lib/county-gis";
import { queryCountyParcels } from "@/lib/parcel-query";
import { Flag, LocateFixed, Lock, Mountain, Plus, Satellite, Search, Trees, Undo2, Upload, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

type Basemap = "sat" | "ortho" | "lidar";

type SearchHit = {
  id: string;
  label: string;
  sub: string;
  lat: number;
  lng: number;
  kind: "stand" | "sign" | "parcel";
};

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MARK_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.name}
          aria-label={c.name}
          onClick={() => onChange(c.value)}
          className={`size-6 rounded-full border ${value === c.value ? "border-fg ring-2 ring-accent" : "border-border"}`}
          style={{ background: c.value }}
        />
      ))}
    </div>
  );
}

function acres(n?: number) {
  if (n == null) return "—";
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ac`;
}

function markIcon(L: typeof import("leaflet"), mark: MapMark, on: boolean) {
  const color = mark.color || (mark.kind === "sign" ? DEFAULT_SIGN_COLOR : DEFAULT_STAND_COLOR);
  const radius = mark.kind === "sign" ? "2px" : "999px";
  return L.divIcon({
    className: `hb-mark${on ? " hb-mark-on" : ""}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div class="hb-pin-wrap${on ? " is-on" : ""}"><span class="hb-pin" style="background:${color};border-radius:${radius}"></span></div>`,
  });
}

function centroid(geom: ParcelGeometry): { lat: number; lng: number } | null {
  const pts: number[][] = [];
  const walk = (g: ParcelGeometry) => {
    if (g.type === "Polygon") {
      const rings = g.coordinates as number[][][];
      pts.push(...(rings[0] || []));
    } else if (g.type === "MultiPolygon") {
      const polys = g.coordinates as number[][][][];
      for (const p of polys) pts.push(...(p[0] || []));
    }
  };
  walk(geom);
  if (!pts.length) return null;
  const lng = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { lat, lng };
}

export function PropertyMap() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const Lref = useRef<typeof import("leaflet") | null>(null);
  const parcelLayer = useRef<import("leaflet").GeoJSON | null>(null);
  const imageHandle = useRef<{ remove: () => void; refresh?: () => void } | null>(null);
  const contourHandle = useRef<{ remove: () => void } | null>(null);
  const xyzLayer = useRef<import("leaflet").TileLayer | null>(null);
  const markGroup = useRef<import("leaflet").FeatureGroup | null>(null);
  const overlayGroup = useRef<import("leaflet").FeatureGroup | null>(null);
  const gpsDot = useRef<import("leaflet").CircleMarker | null>(null);
  const gpsRing = useRef<import("leaflet").Circle | null>(null);
  const gpsWatch = useRef(false);
  const gpsFirst = useRef(true);
  const placeRef = useRef<MarkKind | null>(null);
  const placeColorRef = useRef(DEFAULT_STAND_COLOR);
  const lockRef = useRef(true);
  const labelsRef = useRef(false);
  const editFarmRef = useRef(false);
  const lockedPinsRef = useRef<string[]>([]);
  const parcelsData = useRef<{ features: { properties: ParcelProps; geometry: ParcelGeometry }[] } | null>(null);
  const hasOrthoRef = useRef(false);

  const [selected, setSelected] = useState<ParcelProps | null>(null);
  const [showParcels, setShowParcels] = useState(true);
  const [showLock, setShowLock] = useState(true);
  const [editFarm, setEditFarm] = useState(false);
  const [lockedPins, setLockedPins] = useState<string[]>([]);
  const [showOwnerLabels, setShowOwnerLabels] = useState(false);
  const [showContours, setShowContours] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("sat");
  const basemapRef = useRef<Basemap>("sat");
  basemapRef.current = basemap;
  const activeMarkRef = useRef<string | null>(null);
  const [place, setPlace] = useState<MarkKind | null>(null);
  const [placeColor, setPlaceColor] = useState(DEFAULT_STAND_COLOR);
  const [marks, setMarks] = useState<MapMark[]>([]);
  const [overlays, setOverlays] = useState<MapOverlay[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);
  const [onxOpen, setOnxOpen] = useState(false);
  const [onxNote, setOnxNote] = useState("");
  const [onxLast, setOnxLast] = useState<ImportResult | null>(null);
  const [waypointKind, setWaypointKind] = useState<MarkKind>("stand");
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeMark, setActiveMark] = useState<string | null>(null);
  activeMarkRef.current = activeMark;
  const [query, setQuery] = useState("");
  const [gpsOn, setGpsOn] = useState(false);
  const [gpsNote, setGpsNote] = useState("");
  const [gisNote, setGisNote] = useState("Loading county GIS…");
  const [parcelsTick, setParcelsTick] = useState(0);
  const [intelOpen, setIntelOpen] = useState(false);
  const { weather } = useWeather();
  const { active, ready } = useFarm();
  const farmIdRef = useRef(active.id);
  farmIdRef.current = active.id;
  const activeRef = useRef(active);
  activeRef.current = active;
  const lastFarm = useRef<typeof active | null>(null);
  const persistOn = useRef(false);
  const marksRef = useRef(marks);
  marksRef.current = marks;
  const gisFarm = useRef<string | null>(null);
  const lastMarksJson = useRef("");
  const lastOverlaysJson = useRef("");
  const overlaysRef = useRef(overlays);
  overlaysRef.current = overlays;

  placeRef.current = place;
  placeColorRef.current = placeColor;
  lockRef.current = showLock;
  labelsRef.current = showOwnerLabels;
  editFarmRef.current = editFarm;
  lockedPinsRef.current = lockedPins;

  function isLockedPin(pin?: string | null) {
    return !!pin && lockedPinsRef.current.includes(pin);
  }

  function toggleLockedPin(pin?: string | null) {
    if (!pin) return;
    setLockedPins((cur) => {
      const next = cur.includes(pin) ? cur.filter((p) => p !== pin) : [...cur, pin];
      saveLockedPins(next, farmIdRef.current);
      schedulePush();
      return next;
    });
  }

  function styleParcel(feat?: { properties?: ParcelProps }) {
    const pin = feat?.properties?.PIN;
    const home = lockRef.current && isLockedPin(pin);
    return {
      color: home ? "#c45c18" : "#c8bc9e",
      weight: home ? 3 : showParcels ? 1.1 : 0,
      fillColor: home ? "#c45c18" : "#c8bc9e",
      fillOpacity: 0,
      opacity: showParcels || home ? 1 : 0,
    };
  }

  function restyleParcels() {
    const layer = parcelLayer.current;
    if (!layer) return;
    layer.eachLayer((lyr) => {
      const f = (lyr as import("leaflet").Layer & { feature?: { properties?: ParcelProps } }).feature;
      (lyr as import("leaflet").Path).setStyle(styleParcel(f));
      const p = f?.properties;
      if (labelsRef.current && p?.NAME1) {
        (lyr as import("leaflet").Layer).unbindTooltip();
        (lyr as import("leaflet").Layer).bindTooltip(p.NAME1, { sticky: true, opacity: 0.95 });
      } else {
        (lyr as import("leaflet").Layer).unbindTooltip();
      }
    });
  }

  async function loadGis(lat: number, lng: number, farmId: string) {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    if (gisFarm.current === farmId && parcelLayer.current) return;
    gisFarm.current = farmId;
    setGisNote("Loading county GIS…");
    const result = await queryCountyParcels({ data: { lat, lng } });
    if (farmIdRef.current !== farmId) return;
    hasOrthoRef.current = !!result.hasCountyOrtho;
    const geo = { type: "FeatureCollection" as const, features: result.features || [] };
    parcelsData.current = geo;
    setGisNote(result.note);
    setParcelsTick((n) => n + 1);

    parcelLayer.current?.remove();
    const layer = L.geoJSON(geo as never, {
      style: (feat) => styleParcel(feat as { properties?: ParcelProps }),
      onEachFeature: (feature, lyr) => {
        const p = (feature.properties || {}) as ParcelProps;
        lyr.on("click", (ev) => {
          if (placeRef.current) return;
          L.DomEvent.stop(ev);
          setSelected(p);
          setActiveMark(null);
          if (editFarmRef.current && p.PIN) toggleLockedPin(p.PIN);
        });
      },
    });
    parcelLayer.current = layer;
    layer.addTo(map);
    restyleParcels();

    const pins = loadLockedPins(farmId);
    setLockedPins(pins);
    lockedPinsRef.current = pins;
    if (farmId === "home" && pins.length) {
      const locked = L.geoJSON(geo as never, {
        filter: (feat) => isLockedPin((feat.properties as ParcelProps | undefined)?.PIN),
        style: { opacity: 0, fillOpacity: 0 },
      });
      const b = locked.getBounds();
      if (b.isValid()) map.fitBounds(b.pad(0.06));
    } else {
      map.setView([lat, lng], 15);
    }
  }

  function applyBasemap(kind: Basemap) {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    basemapRef.current = kind;

    if (!map.getPane("satPane")) {
      map.createPane("satPane");
      const pane = map.getPane("satPane");
      if (pane) {
        pane.style.zIndex = "200";
        pane.style.pointerEvents = "none";
      }
    }
    if (!map.getPane("basemapPane")) {
      map.createPane("basemapPane");
      const pane = map.getPane("basemapPane");
      if (pane) {
        pane.style.zIndex = "250";
        pane.style.pointerEvents = "none";
      }
    }

    const xyz =
      kind === "lidar"
        ? { url: LAYERS.hillshade.url, attr: LAYERS.hillshade.attr, maxNativeZoom: LAYERS.hillshade.maxNativeZoom }
        : { url: LAYERS.esriSat.url, attr: LAYERS.esriSat.attr, maxNativeZoom: LAYERS.esriSat.maxNativeZoom };

    xyzLayer.current?.remove();
    xyzLayer.current = L.tileLayer(xyz.url, {
      pane: "satPane",
      attribution: xyz.attr,
      maxZoom: 22,
      maxNativeZoom: xyz.maxNativeZoom,
      tileSize: 256,
      keepBuffer: 8,
      updateWhenZooming: false,
      updateWhenIdle: false,
    }).addTo(map);

    imageHandle.current?.remove();
    imageHandle.current = null;

    if (kind === "ortho") {
      if (hasOrthoRef.current) {
        imageHandle.current = attachEsriImage(L, map, LAYERS.anson2023.url, {}, 1, "basemapPane");
      } else {
        imageHandle.current = attachEsriImage(L, map, LAYERS.naip.url, {}, 1, "basemapPane");
      }
    } else if (kind === "lidar") {
      imageHandle.current = attachEsriImage(L, map, LAYERS.lidar.url, LAYERS.lidar.extra, 0.92, "basemapPane");
    }

    parcelLayer.current?.bringToFront();
    overlayGroup.current?.bringToFront();
    markGroup.current?.bringToFront();
    gpsDot.current?.bringToFront();
    map.invalidateSize({ animate: false });
  }

  function applyContours(on: boolean) {
    const map = mapRef.current;
    const L = Lref.current;
    contourHandle.current?.remove();
    contourHandle.current = null;
    if (!on || !map || !L) return;
    contourHandle.current = attachEsriImage(
      L,
      map,
      LAYERS.contours.url,
      LAYERS.contours.extra,
      0.9,
      "contourPane",
    );
    parcelLayer.current?.bringToFront();
    overlayGroup.current?.bringToFront();
    markGroup.current?.bringToFront();
    gpsDot.current?.bringToFront();
  }

  function redrawMarks(next: MapMark[]) {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    markGroup.current?.clearLayers();
    if (!markGroup.current) {
      markGroup.current = L.featureGroup().addTo(map);
    }
    for (const mark of next) {
      const on = mark.id === activeMarkRef.current;
      const m = L.marker([mark.lat, mark.lng], {
        icon: markIcon(L, mark, on),
        draggable: true,
        title: mark.name,
        riseOnHover: true,
        zIndexOffset: on ? 600 : 0,
      });
      m.on("click", (e) => {
        L.DomEvent.stop(e);
        setSelected(null);
        setActiveMark(mark.id);
        setIntelOpen(false);
      });
      m.on("dragend", () => {
        const ll = m.getLatLng();
        setMarks((cur) => {
          const updated = cur.map((x) => (x.id === mark.id ? { ...x, lat: ll.lat, lng: ll.lng } : x));
          saveMarks(updated, farmIdRef.current);
          return updated;
        });
      });
      m.addTo(markGroup.current);
    }
  }

  function redrawOverlays(next: MapOverlay[], visible: boolean) {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    if (!overlayGroup.current) overlayGroup.current = L.featureGroup().addTo(map);
    overlayGroup.current.clearLayers();
    if (!visible) return;
    for (const o of next) {
      const latlngs = o.coords.map((c) => L.latLng(c.lat, c.lng));
      if (latlngs.length < 2) continue;
      if (o.kind === "shape") {
        L.polygon(latlngs, {
          color: o.color,
          weight: 2,
          fillColor: o.color,
          fillOpacity: 0.18,
          interactive: true,
        })
          .bindTooltip(o.name, { sticky: true })
          .addTo(overlayGroup.current);
      } else {
        L.polyline(latlngs, {
          color: o.color,
          weight: 3,
          opacity: 0.9,
          dashArray: o.kind === "track" ? undefined : "6 6",
        })
          .bindTooltip(o.name, { sticky: true })
          .addTo(overlayGroup.current);
      }
    }
    overlayGroup.current.bringToFront();
    markGroup.current?.bringToFront();
  }

  useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    async function boot() {
      const L = await import("leaflet");
      Lref.current = L;
      if (cancelled || !el.current) return;

      const farm0 = activeRef.current;
      const instance = L.map(el.current, {
        center: [farm0.lat, farm0.lng],
        zoom: 15,
        maxZoom: 22,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 180,
        wheelDebounceTime: 40,
        scrollWheelZoom: true,
        inertia: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: false,
      });
      map = instance;
      mapRef.current = instance;
      if (!instance.getPane("basemapPane")) {
        instance.createPane("basemapPane");
        const pane = instance.getPane("basemapPane");
        if (pane) pane.style.zIndex = "250";
      }
      lastFarm.current = null;
      applyBasemap("sat");

      const paint = () => {
        if (cancelled) return;
        instance.invalidateSize({ animate: false });
      };
      window.setTimeout(paint, 250);

      instance.on("locationfound", (e: { latlng: { lat: number; lng: number }; accuracy: number }) => {
        const here = L.latLng(e.latlng.lat, e.latlng.lng);
        if (!gpsDot.current) {
          gpsDot.current = L.circleMarker(here, {
            radius: 7,
            color: "#e8e0d0",
            weight: 2,
            fillColor: "#4a9ed4",
            fillOpacity: 1,
          }).addTo(instance);
          gpsDot.current.bindTooltip("You", { permanent: false });
        } else {
          gpsDot.current.setLatLng(here);
        }
        if (!gpsRing.current) {
          gpsRing.current = L.circle(here, {
            radius: e.accuracy,
            color: "#4a9ed4",
            weight: 1,
            fillColor: "#4a9ed4",
            fillOpacity: 0.12,
          }).addTo(instance);
        } else {
          gpsRing.current.setLatLng(here);
          gpsRing.current.setRadius(e.accuracy);
        }
        const feet = Math.round(e.accuracy * 3.28084);
        setGpsNote(`GPS on · ±${feet} ft`);
        if (gpsFirst.current) {
          gpsFirst.current = false;
          instance.setView(here, Math.max(instance.getZoom(), 16));
        }
      });

      instance.on("locationerror", (e: { message: string }) => {
        gpsWatch.current = false;
        setGpsOn(false);
        setGpsNote(e.message || "GPS blocked — allow location in the browser.");
      });

      instance.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const kind = placeRef.current;
        if (!kind) return;
        const mark = newMark(kind, e.latlng.lat, e.latlng.lng, placeColorRef.current, marksRef.current);
        setMarks((cur) => {
          const next = [...cur, mark];
          saveMarks(next, farmIdRef.current);
          return next;
        });
        setSelected(null);
        setActiveMark(mark.id);
        setIntelOpen(false);
      });

      const farm = activeRef.current;
      if (cancelled) return;
      applyFarm(farm);
    }

    void boot();
    return () => {
      cancelled = true;
      map?.stopLocate();
      imageHandle.current?.remove();
      contourHandle.current?.remove();
      map?.remove();
      mapRef.current = null;
      xyzLayer.current = null;
      parcelLayer.current = null;
      markGroup.current = null;
      overlayGroup.current = null;
      gisFarm.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyBasemap(basemap);
    applyContours(showContours);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  useEffect(() => {
    applyContours(showContours);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showContours]);

  useEffect(() => {
    restyleParcels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showParcels, showLock, showOwnerLabels, lockedPins]);

  function applyFarm(farm: typeof active) {
    persistOn.current = false;
    const prev = lastFarm.current;
    if (prev && prev.id !== farm.id) {
      saveMarks(
        marksRef.current.filter((m) => Math.hypot(m.lat - prev.lat, m.lng - prev.lng) < 0.06),
        prev.id,
      );
    }
    lastFarm.current = farm;
    gisFarm.current = null;
    const stored = loadFarmMarks(farm);
    lastMarksJson.current = JSON.stringify(stored);
    setMarks(stored);
    const storedOv = clipOverlays(farm.lat, farm.lng, loadOverlays(farm.id));
    lastOverlaysJson.current = JSON.stringify(storedOv);
    setOverlays(storedOv);
    setActiveMark(null);
    setSelected(null);
    mapRef.current?.setView([farm.lat, farm.lng], 15);
    void loadGis(farm.lat, farm.lng, farm.id);
    window.setTimeout(() => {
      applyBasemap(basemapRef.current);
      applyContours(showContours);
      imageHandle.current?.refresh?.();
    }, 80);
    queueMicrotask(() => {
      persistOn.current = true;
    });
  }

  useEffect(() => {
    redrawMarks(marks);
    const json = JSON.stringify(marks);
    const farm = lastFarm.current;
    if (!persistOn.current || !farm || json === lastMarksJson.current) {
      return;
    }
    lastMarksJson.current = json;
    saveMarks(
      marks.filter((m) => Math.hypot(m.lat - farm.lat, m.lng - farm.lng) < 0.06),
      farm.id,
    );
    schedulePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks, activeMark]);

  useEffect(() => {
    redrawOverlays(overlays, showOverlays);
    const json = JSON.stringify(overlays);
    const farm = lastFarm.current;
    if (!persistOn.current || !farm || json === lastOverlaysJson.current) return;
    lastOverlaysJson.current = json;
    saveOverlays(clipOverlays(farm.lat, farm.lng, overlays), farm.id);
    schedulePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlays, showOverlays]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    applyFarm(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active.id]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [] as SearchHit[];
    const out: SearchHit[] = [];
    for (const m of marks) {
      if (m.name.toLowerCase().includes(q) || m.kind.includes(q)) {
        out.push({ id: m.id, label: m.name, sub: m.kind, lat: m.lat, lng: m.lng, kind: m.kind });
      }
    }
    for (const f of parcelsData.current?.features || []) {
      const p = f.properties;
      const blob = `${p.NAME1 || ""} ${p.NAME2 || ""} ${p.PIN || ""} ${p.PHYSADDRESS || ""}`.toLowerCase();
      if (!blob.includes(q)) continue;
      const c = centroid(f.geometry);
      if (!c) continue;
      out.push({
        id: p.PIN || blob,
        label: p.NAME1 || "Parcel",
        sub: `${acres(p.ASSESSEDACREAGE)} · ${p.PIN || ""}`,
        lat: c.lat,
        lng: c.lng,
        kind: "parcel",
      });
    }
    return out.slice(0, 12);
  }, [query, marks]);

  const rankedSits = useMemo(() => {
    const live = weather
      ? {
          quarters: weather.quarters,
          recent: weather.recentQuarters,
          label: weather.windLabel,
          highF: weather.highF,
        }
      : null;
    return marks
      .filter((m) => m.kind === "stand")
      .map((mark) => ({ mark, intel: scoreStand(mark, live, active) }))
      .filter((row): row is { mark: MapMark; intel: NonNullable<ReturnType<typeof scoreStand>> } => !!row.intel)
      .sort((a, b) => b.intel.percent - a.intel.percent);
  }, [marks, weather, active]);

  function openStand(id: string) {
    const m = marks.find((x) => x.id === id);
    if (!m) return;
    setSelected(null);
    setActiveMark(m.id);
    setIntelOpen(false);
    mapRef.current?.setView([m.lat, m.lng], 16);
  }

  function setMarkColor(id: string, color: string) {
    setMarks((cur) => {
      const next = cur.map((m) => (m.id === id ? { ...m, color } : m));
      saveMarks(next, farmIdRef.current);
      schedulePush();
      return next;
    });
  }

  function startPlace(kind: MarkKind) {
    setPlace((cur) => (cur === kind ? null : kind));
    setPlaceColor(kind === "sign" ? DEFAULT_SIGN_COLOR : DEFAULT_STAND_COLOR);
    setEditFarm(false);
    setSelected(null);
    setIntelOpen(false);
  }

  const lockedAcres = useMemo(() => {
    const feats = parcelsData.current?.features || [];
    return feats
      .filter((f) => f.properties.PIN && lockedPins.includes(f.properties.PIN))
      .reduce((sum, f) => sum + (f.properties.ASSESSEDACREAGE || 0), 0);
  }, [lockedPins, marks, parcelsTick]);

  function rename(id: string, name: string) {
    setMarks((cur) => {
      const next = cur.map((m) => (m.id === id ? { ...m, name } : m));
      saveMarks(next, farmIdRef.current);
      return next;
    });
  }

  function removeMark(id: string) {
    setMarks((cur) => {
      const next = cur.filter((m) => m.id !== id);
      saveMarks(next, farmIdRef.current);
      return next;
    });
    setActiveMark(null);
  }

  function resetStands() {
    const id = farmIdRef.current;
    persistOn.current = true;
    const restore = id === "home" ? SEEDED_STANDS : recommendedMarks(active);
    saveMarks(restore, id);
    setMarks(restore);
    setActiveMark(null);
    schedulePush();
  }

  async function importOnxFile(file: File) {
    const farm = activeRef.current;
    try {
      const text = await file.text();
      const parsed = parseMarkupFile(text, file.name);
      const result = mergeMarkup({
        parsed,
        marks: marksRef.current,
        overlays: overlaysRef.current,
        waypointKind,
        farmLat: farm.lat,
        farmLng: farm.lng,
      });
      persistOn.current = true;
      saveMarks(
        result.marks.filter((m) => Math.hypot(m.lat - farm.lat, m.lng - farm.lng) < 0.06),
        farm.id,
      );
      saveOverlays(clipOverlays(farm.lat, farm.lng, result.overlays), farm.id);
      setMarks(result.marks);
      setOverlays(result.overlays);
      setOnxLast(result);
      setOnxOpen(true);
      const total = result.addedStands + result.updatedStands + result.addedSigns + result.addedOverlays;
      setOnxNote(
        total
          ? `Imported ${file.name} onto ${farm.name}.`
          : result.skipped
            ? "File parsed, but nothing sat on this farm. Switch farms or check the export."
            : "No waypoints, tracks, or shapes in that file.",
      );
      schedulePush();
      const first = result.marks[result.marks.length - 1];
      if (first && total) mapRef.current?.setView([first.lat, first.lng], 15);
    } catch (err) {
      setOnxOpen(true);
      setOnxNote(err instanceof Error ? err.message : "Could not read that file.");
    }
  }

  function exportFarm(kind: "gpx" | "kml") {
    const farm = activeRef.current;
    const slug = farm.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "farm";
    if (kind === "gpx") {
      downloadText(`${slug}-huntbrief.gpx`, toGpx(farm.name, marks, overlays), "application/gpx+xml");
      setOnxNote("GPX saved — import it in onX My Content.");
    } else {
      downloadText(`${slug}-huntbrief.kml`, toKml(farm.name, marks, overlays), "application/vnd.google-earth.kml+xml");
      setOnxNote("KML saved — use onX web map to import shapes.");
    }
  }

  function loadSampleOnx() {
    const farm = activeRef.current;
    const sample = sampleMarkupForFarm(farm.lat, farm.lng, farm.name);
    const gpx = parseMarkupFile(sample.gpx, "sample.gpx");
    const kml = parseMarkupFile(sample.kml, "sample.kml");
    const parsed = {
      waypoints: [...gpx.waypoints, ...kml.waypoints],
      overlays: [...gpx.overlays, ...kml.overlays],
    };
    const result = mergeMarkup({
      parsed,
      marks: marksRef.current,
      overlays: overlaysRef.current,
      waypointKind,
      farmLat: farm.lat,
      farmLng: farm.lng,
    });
    persistOn.current = true;
    saveMarks(
      result.marks.filter((m) => Math.hypot(m.lat - farm.lat, m.lng - farm.lng) < 0.06),
      farm.id,
    );
    saveOverlays(clipOverlays(farm.lat, farm.lng, result.overlays), farm.id);
    setMarks(result.marks);
    setOverlays(result.overlays);
    setOnxLast(result);
    setOnxOpen(true);
    setOnxNote("Loaded a sample onX export on this farm — replace it with your real GPX.");
    schedulePush();
  }

  function goTo(hit: SearchHit) {
    mapRef.current?.setView([hit.lat, hit.lng], 16);
    if (hit.kind !== "parcel") setActiveMark(hit.id);
    setQuery("");
  }

  function toggleGps() {
    const map = mapRef.current;
    if (!map) return;
    if (gpsWatch.current) {
      map.stopLocate();
      gpsDot.current?.remove();
      gpsRing.current?.remove();
      gpsDot.current = null;
      gpsRing.current = null;
      gpsWatch.current = false;
      gpsFirst.current = true;
      setGpsOn(false);
      setGpsNote("");
      return;
    }
    if (!navigator.geolocation) {
      setGpsNote("This device has no GPS.");
      return;
    }
    gpsWatch.current = true;
    gpsFirst.current = true;
    setGpsOn(true);
    setGpsNote("Locating…");
    map.locate({
      watch: true,
      enableHighAccuracy: true,
      setView: false,
      maxZoom: 18,
      timeout: 15000,
    });
  }

  const btn = (on: boolean) =>
    `inline-flex min-h-11 select-none items-center gap-1.5 rounded-md px-3 font-display text-[11px] tracking-[0.12em] touch-manipulation ${on ? "bg-accent text-bg" : "border border-border bg-raised text-muted"}`;

  const editing = marks.find((m) => m.id === activeMark);
  const editingIntel =
    editing?.kind === "stand"
      ? scoreStand(
          editing,
          weather
            ? { quarters: weather.quarters, recent: weather.recentQuarters, label: weather.windLabel, highF: weather.highF }
            : null,
          active,
        )
      : null;
  const standCount = marks.filter((m) => m.kind === "stand").length;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stands, signs, owners, PIN"
          className="min-h-11 w-full rounded-md border border-border bg-raised py-2 pl-10 pr-3 text-sm text-fg placeholder:text-muted"
        />
        {hits.length > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-surface">
            {hits.map((h) => (
              <li key={h.id + h.label}>
                <button
                  type="button"
                  onClick={() => goTo(h)}
                  className="flex min-h-11 w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-raised"
                >
                  <span>{h.label}</span>
                  <span className="text-xs text-muted">{h.sub}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => startPlace("stand")} className={btn(place === "stand")}>
          <Trees className="size-4" />
          {place === "stand" ? "TAPPING STANDS" : "STAND"}
        </button>
        <button type="button" onClick={() => startPlace("sign")} className={btn(place === "sign")}>
          <Flag className="size-4" />
          SIGN
        </button>
        <button type="button" onClick={toggleGps} className={btn(gpsOn)}>
          <LocateFixed className="size-4" />
          GPS
        </button>
        <button type="button" onClick={() => { setShowContours(false); setBasemap("ortho"); }} className={btn(basemap === "ortho")}>
          <Satellite className="size-4" />
          AERIAL
        </button>
        <button type="button" onClick={() => { setShowContours(false); setBasemap("sat"); }} className={btn(basemap === "sat")}>
          SAT
        </button>
        <button
          type="button"
          onClick={() => {
            setShowContours(false);
            setBasemap("lidar");
          }}
          className={btn(basemap === "lidar")}
        >
          <Mountain className="size-4" />
          LIDAR
        </button>
        <button type="button" onClick={() => setShowContours((v) => !v)} className={btn(showContours)}>
          CONTOURS
        </button>
        <button type="button" onClick={() => setShowParcels((v) => !v)} className={btn(showParcels)}>
          PARCELS
        </button>
        <button type="button" onClick={() => setShowLock((v) => !v)} className={btn(showLock)}>
          <Lock className="size-4" />
          LOCK
        </button>
        <button type="button" onClick={() => setShowOwnerLabels((v) => !v)} className={btn(showOwnerLabels)}>
          <UserRound className="size-4" />
          OWNERS
        </button>
        <button type="button" onClick={() => setOnxOpen((v) => !v)} className={btn(onxOpen)}>
          <Upload className="size-4" />
          ONX
        </button>
      </div>

      <OnxPanel
        open={onxOpen}
        onToggle={() => setOnxOpen((v) => !v)}
        farmName={active.name}
        waypointKind={waypointKind}
        onWaypointKind={setWaypointKind}
        overlays={overlays}
        showOverlays={showOverlays}
        onShowOverlays={setShowOverlays}
        onPickFile={() => fileRef.current?.click()}
        onSample={loadSampleOnx}
        onExportGpx={() => exportFarm("gpx")}
        onExportKml={() => exportFarm("kml")}
        onDelete={(id) => {
          setOverlays((cur) => {
            const next = cur.filter((o) => o.id !== id);
            saveOverlays(next, farmIdRef.current);
            schedulePush();
            return next;
          });
        }}
        onClear={() => {
          saveOverlays([], farmIdRef.current);
          setOverlays([]);
          schedulePush();
        }}
        note={onxNote}
        last={onxLast}
        fileRef={fileRef}
        onFile={(file) => void importOnxFile(file)}
      />

      <div className={`relative overflow-hidden rounded-md border border-border bg-deep ${place ? "cursor-crosshair" : ""}`}>
        <div className="h-[520px] w-full sm:h-[680px]">
          <div ref={el} id="farm-map" style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      {place ? (
        <p className="font-display text-xs tracking-[0.16em] text-accent">
          TAP THE MAP — {place === "stand" ? `next is Stand ${standCount + 1}` : "drop a sign"}
        </p>
      ) : null}

      {selected && !place ? (
        <div className="flex items-center gap-2 rounded-md border border-accent bg-raised px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm text-fg">{selected.NAME1 || "Parcel"}</p>
            <p className="truncate text-[11px] text-muted">
              {isLockedPin(selected.PIN) ? "In farm" : "Not in farm"} · {acres(selected.ASSESSEDACREAGE)}
            </p>
          </div>
          {selected.PIN ? (
            <button
              type="button"
              onClick={() => toggleLockedPin(selected.PIN)}
              className="h-9 shrink-0 rounded bg-accent px-3 font-display text-[10px] tracking-[0.12em] text-bg"
            >
              {isLockedPin(selected.PIN) ? "REMOVE" : "ADD"}
            </button>
          ) : null}
          <button type="button" onClick={() => setSelected(null)} className="grid size-9 shrink-0 place-items-center text-muted" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {editing && !place ? (
        <div className="rounded-md border border-border bg-raised px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full border border-bg" style={{ background: editing.color }} />
            <input
              value={editing.name}
              onChange={(e) => rename(editing.id, e.target.value)}
              className="min-h-9 min-w-0 flex-1 rounded border border-border bg-bg px-2 text-sm text-fg"
              aria-label="Stand name"
            />
            {editingIntel ? (
              <span className="shrink-0 font-display text-sm text-fg">{editingIntel.percent}%</span>
            ) : null}
            {editing.kind === "stand" ? (
              <button
                type="button"
                onClick={() => setIntelOpen((v) => !v)}
                className="h-9 shrink-0 rounded border border-border px-2 font-display text-[10px] tracking-[0.12em] text-muted"
              >
                {intelOpen ? "HIDE" : "INTEL"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => removeMark(editing.id)}
              className="h-9 shrink-0 rounded border border-border px-2 font-display text-[10px] tracking-[0.12em] text-poor"
            >
              DEL
            </button>
            <button type="button" onClick={() => { setActiveMark(null); setIntelOpen(false); }} className="grid size-9 shrink-0 place-items-center text-muted" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2">
            <ColorSwatches value={editing.color} onChange={(c) => setMarkColor(editing.id, c)} />
          </div>
        </div>
      ) : null}

      <p className="text-xs text-muted">
        {basemap === "lidar" ? "LiDAR on — 3DEP hillshade (works on Buffalo Creek). " : ""}
        {gisNote}. {editFarm ? "Tap a parcel — orange in, tan out. " : ""}
        {lockedAcres.toLocaleString(undefined, { maximumFractionDigits: 2 })} ac in farm
        ({lockedPins.length} tracts)
        {farmIdRef.current === "home" ? ` · deeded ${FARM_DEED_ACRES}` : ""}.
        {standCount ? ` ${standCount} stand${standCount === 1 ? "" : "s"}.` : " No stands yet — tap STAND, then the map."}
        {overlays.length ? ` ${overlays.length} onX layer${overlays.length === 1 ? "" : "s"}.` : ""}
      </p>

      <style>{`
        .hb-mark { background: transparent; border: 0; }
        .hb-pin-wrap {
          width: 28px; height: 28px;
          display: grid; place-items: center;
        }
        .hb-pin {
          width: 10px; height: 10px;
          border: 1px solid #0c0f0b;
          box-shadow: 0 0 0 1px currentColor;
        }
        .hb-pin-wrap.is-on .hb-pin {
          width: 12px; height: 12px;
          box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px #0c0f0b;
        }
      `}</style>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setEditFarm((v) => !v);
            setShowParcels(true);
            setShowLock(true);
            setPlace(null);
            setActiveMark(null);
          }}
          className={btn(editFarm)}
        >
          <Plus className="size-4" />
          {editFarm ? "TAP PARCEL" : "EDIT PARCELS"}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = resetLockedPins(farmIdRef.current);
            setLockedPins(next);
            schedulePush();
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-raised px-3 font-display text-xs tracking-[0.12em] text-muted"
        >
          <Undo2 className="size-4" />
          RESET FARM
        </button>
        <button
          type="button"
          onClick={resetStands}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-raised px-3 font-display text-xs tracking-[0.12em] text-muted"
        >
          <Undo2 className="size-4" />
          RESET STANDS
        </button>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-display text-[11px] tracking-[0.18em] text-muted">STANDS</span>
        <select
          value={activeMark ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) {
              setActiveMark(null);
              setIntelOpen(false);
              return;
            }
            openStand(id);
          }}
          className="min-h-11 w-full rounded-md border border-border bg-raised px-3 text-sm text-fg"
        >
          <option value="">Select a stand or sign…</option>
          {rankedSits.map((row) => (
            <option key={row.mark.id} value={row.mark.id}>
              {row.intel.percent}% · {row.mark.name}
              {row.intel.windGate === "kill" ? " — AVOID" : ""}
            </option>
          ))}
          {marks
            .filter((m) => m.kind === "sign")
            .map((m) => (
              <option key={m.id} value={m.id}>
                Sign · {m.name}
              </option>
            ))}
        </select>
      </label>

      {intelOpen && editing?.kind === "stand" ? (
        <div className="rounded-md border border-border bg-raised p-4">
          <StandIntelCard mark={editing} />
        </div>
      ) : null}
    </div>
  );
}
