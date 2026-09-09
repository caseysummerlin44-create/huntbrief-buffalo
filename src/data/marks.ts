export type MarkKind = "stand" | "sign";

export type MapMark = {
  id: string;
  kind: MarkKind;
  name: string;
  lat: number;
  lng: number;
  color: string;
};

export const MARK_COLORS = [
  { name: "Hunter orange", value: "#c45c18" },
  { name: "Tan", value: "#c8bc9e" },
  { name: "Moss", value: "#7a9b48" },
  { name: "Gold", value: "#c49a38" },
  { name: "Blood", value: "#a05a48" },
  { name: "Bone", value: "#e8e0d0" },
  { name: "Black", value: "#0c0f0b" },
  { name: "Creek blue", value: "#4a7c8c" },
] as const;

export const DEFAULT_STAND_COLOR = "#c45c18";
export const DEFAULT_SIGN_COLOR = "#c8bc9e";

export const SEEDED_STANDS: MapMark[] = [];
export const HOME_STAND_IDS = new Set<string>();
export const HOME_STAND_NAMES = new Set<string>();

function withColor(mark: MapMark): MapMark {
  return {
    ...mark,
    color: mark.color || (mark.kind === "sign" ? DEFAULT_SIGN_COLOR : DEFAULT_STAND_COLOR),
  };
}

export function marksForFarm(_farmId: string, marks: MapMark[]): MapMark[] {
  return (marks || []).map(withColor);
}

function storageKey(farmId: string) {
  return `huntbrief-marks-${farmId}`;
}

export function nearFarm(lat: number, lng: number, mark: MapMark, maxDeg = 0.06) {
  return Math.hypot(mark.lat - lat, mark.lng - lng) < maxDeg;
}

export function clipMarks(farmId: string, lat: number, lng: number, marks: MapMark[]): MapMark[] {
  return marksForFarm(farmId, marks).filter((m) => nearFarm(lat, lng, m));
}

export function hasMarksStore(farmId: string) {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(storageKey(farmId)) != null;
  } catch {
    return false;
  }
}

export function loadMarks(farmId = "home"): MapMark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(farmId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MapMark[];
    if (!Array.isArray(parsed)) return [];
    return marksForFarm(farmId, parsed);
  } catch {
    return [];
  }
}

export function saveMarks(marks: MapMark[], farmId = "home") {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(farmId), JSON.stringify(marksForFarm(farmId, marks)));
}

export function initFarmMarks(farmId: string) {
  localStorage.setItem(storageKey(farmId), JSON.stringify([]));
}

export function nextMarkName(kind: MarkKind, existing: MapMark[]): string {
  const n = existing.filter((m) => m.kind === kind).length + 1;
  return kind === "stand" ? `Stand ${n}` : `Sign ${n}`;
}

export function newMark(kind: MarkKind, lat: number, lng: number, color?: string, existing: MapMark[] = []): MapMark {
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    name: nextMarkName(kind, existing),
    lat,
    lng,
    color: color || (kind === "sign" ? DEFAULT_SIGN_COLOR : DEFAULT_STAND_COLOR),
  };
}
