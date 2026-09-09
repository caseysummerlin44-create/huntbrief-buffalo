export type CountyId = "anson" | "cabarrus";

export type CountyGis = {
  id: CountyId;
  name: string;
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  queryUrl: string;
  outFields: string;
  orderBy?: string;
  hasCountyOrtho: boolean;
};

export const COUNTIES: CountyGis[] = [
  {
    id: "anson",
    name: "Anson County",
    bbox: { minLat: 34.8, maxLat: 35.2, minLng: -80.45, maxLng: -79.85 },
    queryUrl: "https://ansoncountygis.com/arcgis/rest/services/Vector/MapServer/10/query",
    outFields: "PIN,NAME1,NAME2,ASSESSEDACREAGE,PHYSADDRESS,SITUSADDRESS",
    orderBy: "ASSESSEDACREAGE DESC",
    hasCountyOrtho: true,
  },
  {
    id: "cabarrus",
    name: "Cabarrus County",
    bbox: { minLat: 35.22, maxLat: 35.55, minLng: -80.9, maxLng: -80.35 },
    queryUrl: "https://location.cabarruscounty.us/arcgisservices/rest/services/Tax_Parcels_Full/MapServer/0/query",
    outFields: "PIN,PIN14,PARCEL,AcctName1,AcctName2,CALCULATED_ACREAGE,LandUnits,LegalDesc",
    orderBy: "CALCULATED_ACREAGE DESC",
    hasCountyOrtho: false,
  },
];

export type ParcelProps = {
  PIN?: string;
  NAME1?: string;
  NAME2?: string;
  ASSESSEDACREAGE?: number;
  PHYSADDRESS?: string | null;
  SITUSADDRESS?: string | null;
};

/** Nested GeoJSON coordinates — finite depth so server fns stay serializable. */
export type ParcelCoordinates = number[] | number[][] | number[][][] | number[][][][];

export type ParcelGeometry = {
  type: string;
  coordinates: ParcelCoordinates;
};

export type ParcelFeature = {
  type: "Feature";
  properties: ParcelProps;
  geometry: ParcelGeometry;
};

export function detectCounty(lat: number, lng: number): CountyGis | null {
  return (
    COUNTIES.find(
      (c) =>
        lat >= c.bbox.minLat &&
        lat <= c.bbox.maxLat &&
        lng >= c.bbox.minLng &&
        lng <= c.bbox.maxLng,
    ) || null
  );
}

function pinOf(raw: Record<string, unknown>): string {
  const v = raw.PIN14 ?? raw.PARCEL ?? raw.PIN ?? "";
  return String(v).replace(/\.0+$/, "").trim();
}

function acresOf(raw: Record<string, unknown>): number | undefined {
  const n = Number(raw.ASSESSEDACREAGE ?? raw.LandUnits ?? raw.CALCULATED_ACREAGE);
  return Number.isFinite(n) ? n : undefined;
}

function asCoordinates(value: unknown): ParcelCoordinates {
  return (Array.isArray(value) ? value : []) as ParcelCoordinates;
}

export function normalizeParcels(geo: {
  type?: string;
  features?: { properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: unknown } }[];
}): { type: "FeatureCollection"; features: ParcelFeature[] } {
  const features: ParcelFeature[] = [];
  for (const f of geo.features || []) {
    if (!f.geometry) continue;
    const raw = f.properties || {};
    features.push({
      type: "Feature",
      properties: {
        PIN: pinOf(raw) || undefined,
        NAME1: String(raw.NAME1 ?? raw.AcctName1 ?? "").trim() || "Unknown owner",
        NAME2: String(raw.NAME2 ?? raw.AcctName2 ?? "").trim() || undefined,
        ASSESSEDACREAGE: acresOf(raw),
        PHYSADDRESS: (raw.PHYSADDRESS as string) || (raw.LegalDesc as string) || null,
        SITUSADDRESS: (raw.SITUSADDRESS as string) || null,
      },
      geometry: {
        type: String(f.geometry.type || "Polygon"),
        coordinates: asCoordinates(f.geometry.coordinates),
      },
    });
  }
  return { type: "FeatureCollection", features };
}

export function parcelQueryUrl(county: CountyGis, lat: number, lng: number, pad = 0.02) {
  const params = new URLSearchParams({
    f: "geojson",
    geometry: `${lng - pad},${lat - pad},${lng + pad},${lat + pad}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: county.outFields,
    where: "1=1",
    resultRecordCount: "1500",
  });
  if (county.orderBy) params.set("orderByFields", county.orderBy);
  return `${county.queryUrl}?${params.toString()}`;
}
