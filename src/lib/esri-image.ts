import type { ImageOverlay, Map as LMap } from "leaflet";

type Handle = { refresh: () => void; remove: () => void };

function buildUrl(
  endpoint: string,
  bbox: string,
  size: { x: number; y: number },
  extra: Record<string, string>,
) {
  const w = Math.min(2048, Math.max(64, Math.round(size.x)));
  const h = Math.min(2048, Math.max(64, Math.round(size.y)));
  const params = new URLSearchParams({
    bbox,
    bboxSR: "4326",
    imageSR: "3857",
    size: `${w},${h}`,
    format: extra.format || "jpg",
    f: "image",
    interpolation: "RSP_BilinearInterpolation",
    ...extra,
  });
  return `${endpoint}?${params.toString()}`;
}

export function attachEsriImage(
  L: typeof import("leaflet"),
  map: LMap,
  endpoint: string,
  extra: Record<string, string> = {},
  opacity = 1,
  pane = "basemapPane",
): Handle {
  if (!map.getPane(pane)) {
    map.createPane(pane);
    const el = map.getPane(pane);
    if (el) {
      el.style.zIndex = pane === "contourPane" ? "360" : "250";
      el.style.pointerEvents = "none";
    }
  }

  let overlay: ImageOverlay | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const refresh = () => {
    const b = map.getBounds();
    const size = map.getSize();
    if (size.x < 40 || size.y < 40) return;
    const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
    const src = buildUrl(endpoint, bbox, size, extra);
    if (overlay) {
      overlay.setUrl(src);
      overlay.setBounds(b);
    } else {
      overlay = L.imageOverlay(src, b, { opacity, pane, zIndex: 1, interactive: false }).addTo(map);
    }
  };

  const onMove = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, 280);
  };

  map.on("moveend", onMove);
  map.on("zoomend", onMove);
  refresh();

  return {
    refresh,
    remove() {
      map.off("moveend", onMove);
      map.off("zoomend", onMove);
      if (timer) clearTimeout(timer);
      overlay?.remove();
      overlay = null;
    },
  };
}

export const LAYERS = {
  esriSat: {
    type: "xyz" as const,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Esri World Imagery",
    maxNativeZoom: 19,
  },
  hillshade: {
    type: "xyz" as const,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}",
    attr: "Esri / USGS 3DEP hillshade",
    maxNativeZoom: 16,
  },
  hillshadeDark: {
    type: "xyz" as const,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade_Dark/MapServer/tile/{z}/{y}/{x}",
    attr: "Esri dark hillshade",
    maxNativeZoom: 16,
  },
  anson2023: {
    type: "export" as const,
    url: "https://ansoncountygis.com/arcgis/rest/services/Orthos2023M/MapServer/export",
    attr: "Anson County 2023 ortho",
  },
  naip: {
    type: "export" as const,
    url: "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage",
    attr: "USDA NAIP aerial",
  },
  lidar: {
    type: "export" as const,
    url: "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage",
    extra: {
      renderingRule: JSON.stringify({ rasterFunction: "Hillshade Multidirectional" }),
      format: "jpg",
    },
    attr: "USGS 3DEP LiDAR hillshade",
  },
  contours: {
    type: "export" as const,
    url: "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage",
    extra: {
      renderingRule: JSON.stringify({ rasterFunction: "Preset 2ft Contour Interval" }),
      format: "png",
    },
    attr: "USGS 3DEP 2-ft contours",
  },
};
