import { detectCounty } from "@/lib/county-gis";

export type Farm = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  county?: string;
  home?: boolean;
};

/** Share build has no home farm. Name kept so existing imports compile. */
export const BUFFALO_FARM: Farm = {
  id: "farm-1787281048320",
  name: "Buffalo Creek Hunt Club",
  lat: 35.37536111111111,
  lng: -80.43341666666667,
  county: "cabarrus",
};

export const HOME_FARM: Farm = BUFFALO_FARM;

export const SEEDED_FARMS: Farm[] = [BUFFALO_FARM];
const SEEDED_IDS = new Set(SEEDED_FARMS.map((f) => f.id));

export function isSeededFarm(id: string) {
  return SEEDED_IDS.has(id);
}

export function withCounty(farm: Farm): Farm {
  if (farm.county) return farm;
  return { ...farm, county: detectCounty(farm.lat, farm.lng)?.id };
}

export function mergeSeededFarms(_farms?: Farm[] | null): Farm[] {
  return [...SEEDED_FARMS];
}

export function loadFarms(): Farm[] {
  return [...SEEDED_FARMS];
}

export function saveFarms(_farms: Farm[]) {}

export function loadActiveFarmId(): string {
  return BUFFALO_FARM.id;
}

export function saveActiveFarmId(_id: string) {}

export function newFarm(name: string, lat: number, lng: number): Farm {
  return {
    id: `farm-${Date.now()}`,
    name: name.trim() || "New farm",
    lat,
    lng,
    county: detectCounty(lat, lng)?.id,
  };
}
