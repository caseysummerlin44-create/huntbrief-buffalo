import {
  DEFAULT_SIGN_COLOR,
  DEFAULT_STAND_COLOR,
  type MapMark,
  type MarkKind,
} from "@/data/marks";
import { type MapOverlay, type OverlayKind } from "@/data/overlays";

export type ParsedMarkup = {
  waypoints: { name: string; lat: number; lng: number; color: string }[];
  overlays: Omit<MapOverlay, "id">[];
};

export type ImportResult = {
  marks: MapMark[];
  overlays: MapOverlay[];
  addedStands: number;
  updatedStands: number;
  addedSigns: number;
  addedOverlays: number;
  skipped: number;
};

function localName(el: Element) {
  return (el.localName || el.tagName).replace(/^.*:/, "").toLowerCase();
}

function descendants(root: ParentNode, name: string): Element[] {
  return [...root.querySelectorAll("*")].filter((n) => n instanceof Element && localName(n) === name) as Element[];
}

function childText(el: Element, name: string): string {
  for (const n of el.children) {
    if (localName(n) === name) return (n.textContent || "").trim();
  }
  return "";
}

function parseCoordPair(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function parseKmlCoordBlob(text: string) {
  const out: { lat: number; lng: number }[] = [];
  for (const tok of text.trim().split(/[\s\n]+/)) {
    if (!tok.includes(",")) continue;
    const [lngS, latS] = tok.split(",");
    const pair = parseCoordPair(Number(latS), Number(lngS));
    if (pair) out.push(pair);
  }
  return out;
}

function kmlColorToHex(raw: string | undefined, fallback: string) {
  const s = (raw || "").trim().replace(/^#/, "");
  if (s.length === 8) {
    const b = s.slice(2, 4);
    const g = s.slice(4, 6);
    const r = s.slice(6, 8);
    return `#${r}${g}${b}`.toLowerCase();
  }
  if (s.length === 6) return `#${s}`.toLowerCase();
  return fallback;
}

function styleColorOf(style: Element | undefined, fallback: string) {
  if (!style) return fallback;
  const direct = childText(style, "color");
  if (direct) return kmlColorToHex(direct, fallback);
  for (const tag of ["linestyle", "polystyle", "iconstyle"] as const) {
    const nested = descendants(style, tag)[0];
    const c = nested ? childText(nested, "color") : "";
    if (c) return kmlColorToHex(c, fallback);
  }
  return fallback;
}

function firstStyleColor(doc: Document, styleUrl: string, fallback: string) {
  const id = styleUrl.replace(/^#/, "");
  if (!id) return fallback;
  for (const style of descendants(doc, "style")) {
    if ((style.getAttribute("id") || "") !== id) continue;
    return styleColorOf(style, fallback);
  }
  return fallback;
}

function looksLikeSign(name: string) {
  return /\b(cam(era)?|scrape|rub|sign|trail cam|bedding|bed|plot|food plot|pond|water|mock|lick|mineral)\b/i.test(
    name,
  );
}

function parseGpx(doc: Document): ParsedMarkup {
  const waypoints: ParsedMarkup["waypoints"] = [];
  const overlays: ParsedMarkup["overlays"] = [];

  for (const wpt of descendants(doc, "wpt")) {
    const pair = parseCoordPair(Number(wpt.getAttribute("lat")), Number(wpt.getAttribute("lon")));
    if (!pair) continue;
    const name = childText(wpt, "name") || `Waypoint ${waypoints.length + 1}`;
    waypoints.push({ ...pair, name, color: DEFAULT_STAND_COLOR });
  }

  for (const trk of descendants(doc, "trk")) {
    const name = childText(trk, "name") || `Track ${overlays.length + 1}`;
    const coords: { lat: number; lng: number }[] = [];
    for (const pt of descendants(trk, "trkpt")) {
      const pair = parseCoordPair(Number(pt.getAttribute("lat")), Number(pt.getAttribute("lon")));
      if (pair) coords.push(pair);
    }
    if (coords.length >= 2) {
      overlays.push({ kind: "track", name, color: "#4a7c8c", coords, source: "onx" });
    }
  }

  for (const rte of descendants(doc, "rte")) {
    const name = childText(rte, "name") || `Route ${overlays.length + 1}`;
    const coords: { lat: number; lng: number }[] = [];
    for (const pt of descendants(rte, "rtept")) {
      const pair = parseCoordPair(Number(pt.getAttribute("lat")), Number(pt.getAttribute("lon")));
      if (pair) coords.push(pair);
    }
    if (coords.length >= 2) {
      overlays.push({ kind: "line", name, color: "#c49a38", coords, source: "onx" });
    }
  }

  return { waypoints, overlays };
}

function parseKml(doc: Document): ParsedMarkup {
  const waypoints: ParsedMarkup["waypoints"] = [];
  const overlays: ParsedMarkup["overlays"] = [];

  for (const pm of descendants(doc, "placemark")) {
    const name = childText(pm, "name") || "Untitled";
    const styleUrl = childText(pm, "styleurl");
    const point = descendants(pm, "point")[0];
    const line = descendants(pm, "linestring")[0];
    const poly = descendants(pm, "polygon")[0];
    const gxTrack = descendants(pm, "track")[0];

    if (point) {
      const coords = parseKmlCoordBlob(childText(point, "coordinates"));
      if (coords[0]) {
        waypoints.push({
          name,
          lat: coords[0].lat,
          lng: coords[0].lng,
          color: firstStyleColor(doc, styleUrl, DEFAULT_STAND_COLOR),
        });
      }
      continue;
    }

    if (line) {
      const coords = parseKmlCoordBlob(childText(line, "coordinates"));
      if (coords.length >= 2) {
        overlays.push({
          kind: "line",
          name,
          color: firstStyleColor(doc, styleUrl, "#c49a38"),
          coords,
          source: "onx",
        });
      }
      continue;
    }

    if (poly) {
      const ring = descendants(pm, "linearring")[0];
      const coords = parseKmlCoordBlob(ring ? childText(ring, "coordinates") : childText(poly, "coordinates"));
      if (coords.length >= 3) {
        overlays.push({
          kind: "shape",
          name,
          color: firstStyleColor(doc, styleUrl, "#7a9b48"),
          coords,
          source: "onx",
        });
      }
      continue;
    }

    if (gxTrack) {
      const coords: { lat: number; lng: number }[] = [];
      for (const c of descendants(gxTrack, "coord")) {
        const parts = (c.textContent || "").trim().split(/\s+/);
        const pair = parseCoordPair(Number(parts[1]), Number(parts[0]));
        if (pair) coords.push(pair);
      }
      if (coords.length >= 2) {
        overlays.push({ kind: "track", name, color: "#4a7c8c", coords, source: "onx" });
      }
    }
  }

  return { waypoints, overlays };
}

export function parseMarkupFile(text: string, filename = ""): ParsedMarkup {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return { waypoints: [], overlays: [] };
  const doc = new DOMParser().parseFromString(trimmed, "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("That file is not valid GPX or KML.");
  const looksGpx = /gpx/i.test(filename) || descendants(doc, "gpx").length > 0 || descendants(doc, "wpt").length > 0;
  const looksKml = /kml/i.test(filename) || descendants(doc, "kml").length > 0 || descendants(doc, "placemark").length > 0;
  if (looksGpx && !looksKml) return parseGpx(doc);
  if (looksKml) return parseKml(doc);
  if (looksGpx) return parseGpx(doc);
  throw new Error("Need a .gpx or .kml export from onX My Content.");
}

function sameName(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function mergeMarkup(opts: {
  parsed: ParsedMarkup;
  marks: MapMark[];
  overlays: MapOverlay[];
  waypointKind: MarkKind;
  farmLat: number;
  farmLng: number;
}): ImportResult {
  const { parsed, waypointKind, farmLat, farmLng } = opts;
  const marks = opts.marks.map((m) => ({ ...m }));
  const overlays = opts.overlays.map((o) => ({ ...o, coords: [...o.coords] }));
  let addedStands = 0;
  let updatedStands = 0;
  let addedSigns = 0;
  let addedOverlays = 0;
  let skipped = 0;
  const stamp = Date.now();

  for (const w of parsed.waypoints) {
    if (Math.hypot(w.lat - farmLat, w.lng - farmLng) > 0.08) {
      skipped += 1;
      continue;
    }
    const existing = marks.find((m) => sameName(m.name, w.name));
    if (existing) {
      existing.lat = w.lat;
      existing.lng = w.lng;
      updatedStands += 1;
      continue;
    }
    const kind: MarkKind = looksLikeSign(w.name) ? "sign" : waypointKind;
    marks.push({
      id: `${kind}-onx-${stamp}-${marks.length}`,
      kind,
      name: w.name,
      lat: w.lat,
      lng: w.lng,
      color: kind === "sign" ? DEFAULT_SIGN_COLOR : w.color || DEFAULT_STAND_COLOR,
    });
    if (kind === "sign") addedSigns += 1;
    else addedStands += 1;
  }

  for (const o of parsed.overlays) {
    const c = o.coords[0];
    if (!c || Math.hypot(c.lat - farmLat, c.lng - farmLng) > 0.12) {
      skipped += 1;
      continue;
    }
    const existing = overlays.find((x) => sameName(x.name, o.name) && x.kind === o.kind);
    if (existing) {
      existing.coords = o.coords;
      existing.color = o.color;
      existing.source = o.source;
      addedOverlays += 1;
      continue;
    }
    overlays.push({
      ...o,
      id: `ov-onx-${stamp}-${overlays.length}`,
    });
    addedOverlays += 1;
  }

  return { marks, overlays, addedStands, updatedStands, addedSigns, addedOverlays, skipped };
}

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export function toGpx(farmName: string, marks: MapMark[], overlays: MapOverlay[]) {
  const wpts = marks
    .map(
      (m) => `  <wpt lat="${m.lat.toFixed(6)}" lon="${m.lng.toFixed(6)}">
    <name>${xmlEscape(m.name)}</name>
    <type>${m.kind === "stand" ? "Stand" : "Sign"}</type>
  </wpt>`,
    )
    .join("\n");
  const trks = overlays
    .filter((o) => o.kind !== "shape")
    .map((o) => {
      const pts = o.coords.map((c) => `      <trkpt lat="${c.lat.toFixed(6)}" lon="${c.lng.toFixed(6)}"></trkpt>`).join("\n");
      return `  <trk>
    <name>${xmlEscape(o.name)}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="HuntBrief" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${xmlEscape(farmName)} — HuntBrief</name></metadata>
${wpts}
${trks}
</gpx>
`;
}

export function toKml(farmName: string, marks: MapMark[], overlays: MapOverlay[]) {
  const pins = marks
    .map(
      (m) => `    <Placemark>
      <name>${xmlEscape(m.name)}</name>
      <styleUrl>#${m.kind}</styleUrl>
      <Point><coordinates>${m.lng.toFixed(6)},${m.lat.toFixed(6)},0</coordinates></Point>
    </Placemark>`,
    )
    .join("\n");
  const shapes = overlays
    .map((o) => {
      const ring = o.coords.map((c) => `${c.lng.toFixed(6)},${c.lat.toFixed(6)},0`).join(" ");
      if (o.kind === "shape") {
        return `    <Placemark>
      <name>${xmlEscape(o.name)}</name>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>${ring}</coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>`;
      }
      return `    <Placemark>
      <name>${xmlEscape(o.name)}</name>
      <LineString><coordinates>${ring}</coordinates></LineString>
    </Placemark>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${xmlEscape(farmName)} — HuntBrief</name>
    <Style id="stand"><IconStyle><color>ff185cc4</color></IconStyle></Style>
    <Style id="sign"><IconStyle><color>ff9ebcc8</color></IconStyle></Style>
${pins}
${shapes}
  </Document>
</kml>
`;
}

export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function overlayKindLabel(kind: OverlayKind) {
  if (kind === "shape") return "SHAPE";
  if (kind === "track") return "TRACK";
  return "LINE";
}

export function sampleMarkupForFarm(lat: number, lng: number, farmName: string) {
  const w = (dlat: number, dlng: number, name: string) =>
    `  <wpt lat="${(lat + dlat).toFixed(6)}" lon="${(lng + dlng).toFixed(6)}"><name>${name}</name></wpt>`;
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="onX Hunt" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${farmName} sample onX export</name></metadata>
${w(0.0042, -0.0004, "Upper Food Plot")}
${w(0.0056, -0.0021, "OnX Ridge Cam")}
${w(0.0010, 0.0012, "OnX Staging Oak")}
  <trk>
    <name>Hidden Access — west ditch</name>
    <trkseg>
      <trkpt lat="${(lat - 0.002).toFixed(6)}" lon="${(lng - 0.0039).toFixed(6)}"></trkpt>
      <trkpt lat="${(lat - 0.0004).toFixed(6)}" lon="${(lng - 0.003).toFixed(6)}"></trkpt>
      <trkpt lat="${(lat + 0.0012).toFixed(6)}" lon="${(lng - 0.0022).toFixed(6)}"></trkpt>
      <trkpt lat="${(lat + 0.0028).toFixed(6)}" lon="${(lng - 0.0015).toFixed(6)}"></trkpt>
    </trkseg>
  </trk>
</gpx>`;
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${farmName} sample plot</name>
    <Placemark>
      <name>Fall food plot — north beans edge</name>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>
        ${(lng - 0.0016).toFixed(5)},${(lat + 0.0046).toFixed(5)},0
        ${(lng + 0.0003).toFixed(5)},${(lat + 0.0046).toFixed(5)},0
        ${(lng + 0.0003).toFixed(5)},${(lat + 0.0038).toFixed(5)},0
        ${(lng - 0.0016).toFixed(5)},${(lat + 0.0038).toFixed(5)},0
        ${(lng - 0.0016).toFixed(5)},${(lat + 0.0046).toFixed(5)},0
      </coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>
  </Document>
</kml>`;
  return { gpx, kml };
}
