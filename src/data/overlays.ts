export type OverlayKind = "track" | "line" | "shape";

export type MapOverlay = {
  id: string;
  kind: OverlayKind;
  name: string;
  color: string;
  coords: { lat: number; lng: number }[];
  source?: string;
};

function storageKey(farmId: string) {
  return `huntbrief-overlays-${farmId}`;
}

export function loadOverlays(farmId: string): MapOverlay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(farmId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MapOverlay[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((o) => o && Array.isArray(o.coords) && o.coords.length >= 2);
  } catch {
    return [];
  }
}

export function saveOverlays(overlays: MapOverlay[], farmId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(farmId), JSON.stringify(overlays));
}

export function clipOverlays(lat: number, lng: number, overlays: MapOverlay[], maxDeg = 0.12): MapOverlay[] {
  return overlays.filter((o) => {
    const c = o.coords[0];
    return c && Math.hypot(c.lat - lat, c.lng - lng) < maxDeg;
  });
}
