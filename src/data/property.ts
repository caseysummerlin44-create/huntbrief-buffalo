/** Public share build — no Anson parcels, pins, or acreage. */
export const FARM_PIN = { lat: 35.37536111111111, lng: -80.43341666666667 };
export const FARM_LOCKED_PINS: string[] = [];
export const FARM_DEED_ACRES = 0;

export function loadLockedPins(_farmId = "home"): string[] {
  return [];
}

export function saveLockedPins(_pins: string[], _farmId = "home") {}

export function resetLockedPins(_farmId = "home"): string[] {
  return [];
}

export function loadAllLockedPins(): Record<string, string[]> {
  return {};
}

export function saveAllLockedPins(_byFarm: Record<string, string[]>) {}
