import { detectCounty, normalizeParcels, parcelQueryUrl } from "@/lib/county-gis";
import { createServerFn } from "@tanstack/react-start";

export const queryCountyParcels = createServerFn({ method: "POST" })
  .validator((d: { lat: number; lng: number }) => d)
  .handler(async ({ data }) => {
    const county = detectCounty(data.lat, data.lng);
    if (!county) {
      return {
        ok: false as const,
        county: null,
        countyName: null,
        hasCountyOrtho: false,
        features: [],
        note: "No county GIS wired for this pin yet.",
      };
    }
    const url = parcelQueryUrl(county, data.lat, data.lng);
    const res = await fetch(url, { headers: { Accept: "application/json, application/geo+json" } });
    if (!res.ok) {
      return {
        ok: false as const,
        county: county.id,
        countyName: county.name,
        hasCountyOrtho: county.hasCountyOrtho,
        features: [],
        note: `${county.name} GIS returned ${res.status}.`,
      };
    }
    const geo = (await res.json()) as { features?: unknown[] };
    const normalized = normalizeParcels(geo as Parameters<typeof normalizeParcels>[0]);
    return {
      ok: true as const,
      county: county.id,
      countyName: county.name,
      hasCountyOrtho: county.hasCountyOrtho,
      features: normalized.features,
      note: `${county.name} GIS · ${normalized.features.length} tracts`,
    };
  });
