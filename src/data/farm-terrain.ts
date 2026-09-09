import { clipMarks, hasMarksStore, loadMarks, saveMarks, type MapMark } from "@/data/marks";
import type { Farm } from "@/data/farms";

export type WatchKind = "bedding" | "funnel" | "food" | "staging" | "water";

export type WatchArea = {
  id: string;
  name: string;
  kind: WatchKind;
  favored: string[];
  kill: string[];
  lookFor: string;
  why: string;
  camera: string;
  access: string;
  lat?: number;
  lng?: number;
};

export type FarmTerrain = {
  id: string;
  name: string;
  thesis: string;
  lateSummer: string;
  areas: WatchArea[];
};

export const ANSON_TERRAIN: FarmTerrain = {
  id: "none",
  name: "",
  thesis: "",
  lateSummer: "",
  areas: [],
};

export const CABARRUS_TERRAIN: FarmTerrain = {
  id: "cabarrus",
  name: "Buffalo Creek Hunt Club",
  thesis:
    "Learned from your onX LiDAR. Magenta tract on Dutch Buffalo Creek, Adams Creek cutting the north timber. Creek ~436 ft, ridge ~550. Beds on the south-facing Adams Creek bench (red-dashed timber, backs to houses). Food is the interior long plot and marked pockets. Two ponds on the west 550-ft ridge. Powerline pinches a timber finger. Subdivisions north, preserve trail, Willow Creek Airport south. Hunt intercepts and water. Do not hunt the creek bottom.",
  lateSummer:
    "August is cameras and water. Pull the ridge-pond cards. Glass the long plot after dark. The only daylight sit in this heat is the timber staging pocket on a west/SW wind — and even that is a maybe.",
  areas: [
    {
      id: "adams-bench",
      name: "Adams Creek bench",
      kind: "bedding",
      favored: ["SW", "S", "W"],
      kill: ["N", "NE", "E"],
      lat: 35.37855,
      lng: -80.4317,
      lookFor: "Beds on the south-facing drop into Adams Creek. Rubs on the first bench. Do not walk the crest.",
      why: "LiDAR: red-dashed timber above Adams Creek, 550-ft ridge dropping to water. Mature buck hide from the subdivision. SW/W dumps scent into the house buffer, not the food.",
      camera: "South-edge trail, 60–80 yards off the beds. Cards only in this heat.",
      access: "Mallou / Mount Pleasant Road. Never the creek. Never the houses.",
    },
    {
      id: "buffalo-terrace",
      name: "Dutch Buffalo terrace",
      kind: "funnel",
      favored: ["N", "NW", "W"],
      kill: ["S", "SE", "SW"],
      lat: 35.3761,
      lng: -80.4276,
      lookFor: "Parallel trails on the 510–520 ft terrace, not in the water. Creek crossings after rain.",
      why: "LiDAR: Dutch Buffalo is the east wall. Deer travel the first terrace. S/SW sends scent up the whole corridor. Hold until a north or west wind.",
      camera: "Crossing + terrace trail.",
      access: "Stay high. Do not walk the creek.",
    },
    {
      id: "long-plot",
      name: "Interior long plot",
      kind: "food",
      favored: ["N", "NW", "W"],
      kill: ["S", "SE", "SW"],
      lat: 35.3729,
      lng: -80.4313,
      lookFor: "Which end they enter. Entry end points at the bed. Camera cluster (Smith side).",
      why: "LiDAR: elongated destination plot. August they hit it after legal light. Sitting it on a south wind educates the farm. Cards until a north wind.",
      camera: "Keep the cluster. Add one cam on the timber trail into the north end.",
      access: "South/west field edge after they’re gone. No headlights on the plot.",
    },
    {
      id: "staging-pocket",
      name: "Timber staging pocket",
      kind: "staging",
      favored: ["W", "SW", "NW"],
      kill: ["E", "SE"],
      lat: 35.3766,
      lng: -80.4299,
      lookFor: "Isolated opening in timber west of the creek (yellow pentagon / kidney). Scrapes on the downwind edge.",
      why: "LiDAR: Higgins staging, not destination. Cover + a bite between Adams Creek beds and the long plot. West/SW sits the east edge with scent into dead ground.",
      camera: "Downwind scrape, not the opening.",
      access: "West timber. Don’t cut the plot.",
    },
    {
      id: "ridge-ponds",
      name: "West ridge ponds",
      kind: "water",
      favored: ["SW", "W", "S"],
      kill: ["N", "E"],
      lat: 35.37585,
      lng: -80.4369,
      lookFor: "Two ponds on the 550-ft ridge near Augsburg. Tracks in the mud. Trails from the north timber.",
      why: "LiDAR: late-summer gold. A mature buck waters closer to bed than he feeds. SW/W keeps you off the Adams Creek beds. This is the camera to pull first.",
      camera: "Mud edge, north trail in, south trail out.",
      access: "Mallou Road. In and out. Don’t linger.",
    },
    {
      id: "powerline-pinch",
      name: "Powerline pinch",
      kind: "funnel",
      favored: ["N", "NW", "W"],
      kill: ["S", "SW"],
      lat: 35.3737,
      lng: -80.4348,
      lookFor: "Where the powerline cuts a timber finger south of Adams Creek. Tracks crossing, not walking the line.",
      why: "LiDAR: easy travel, easy to bump. Hunt the timber edge that pinches the line, not the right-of-way.",
      camera: "The crossing, aimed off the line.",
      access: "Don’t walk the powerline in daylight.",
    },
    {
      id: "north-field",
      name: "Preserve edge field",
      kind: "food",
      favored: ["SW", "W"],
      kill: ["N", "NE"],
      lat: 35.3809,
      lng: -80.4304,
      lookFor: "Open field north of Adams Creek against Catawba Lands Conservancy. Sanctuary buffer.",
      why: "LiDAR: release valve against the preserve trail. Glass it. Don’t sit it. Leave it so bucks keep using your timber.",
      camera: "One cam on your side of the line, not over it.",
      access: "Stay off the preserve trail.",
    },
  ],
};

export function terrainFor(_farm: Farm): FarmTerrain {
  return CABARRUS_TERRAIN;
}

export function pickWatchAreas(
  terrain: FarmTerrain,
  quarters: string[],
  heat: boolean,
  window: "morning" | "afternoon" = "morning",
): WatchArea[] {
  const q = quarters.map((x) => x.toUpperCase());
  const scored = terrain.areas.map((a) => {
    const play = a.favored.some((w) => q.includes(w));
    const kill = a.kill.some((w) => q.includes(w));
    let n = 40;
    if (play && !kill) n += 30;
    if (kill && !play) n -= 28;
    if (heat && (a.kind === "water" || a.kind === "staging")) n += 12;
    if (heat && a.kind === "food") n -= 8;
    if (heat && a.kind === "bedding") n -= 6;
    if (window === "morning" && a.kind === "food") n -= 10;
    if (window === "morning" && (a.kind === "water" || a.kind === "staging")) n += 6;
    if (window === "afternoon" && a.kind === "bedding") n -= 8;
    if (window === "afternoon" && (a.kind === "staging" || a.kind === "food")) n += 8;
    return { a, n };
  });
  return scored.sort((x, y) => y.n - x.n).map((x) => x.a);
}

export function kindLabel(kind: WatchKind) {
  return kind === "bedding"
    ? "BEDDING"
    : kind === "funnel"
      ? "FUNNEL"
      : kind === "food"
        ? "FOOD"
        : kind === "staging"
          ? "STAGING"
          : "WATER";
}

const KIND_COLOR: Record<WatchKind, string> = {
  bedding: "#c45c18",
  funnel: "#4a7c8c",
  food: "#7a9b48",
  staging: "#c49a38",
  water: "#4a7c8c",
};

export function recommendedMarks(farm: Farm): MapMark[] {
  const terrain = terrainFor(farm);
  if (farm.home) return [];
  return terrain.areas
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({
      id: a.id,
      kind: a.id === "north-field" ? "sign" : "stand",
      name: a.name,
      lat: a.lat as number,
      lng: a.lng as number,
      color: KIND_COLOR[a.kind],
    }));
}

export function nearestWatch(lat: number, lng: number, terrain: FarmTerrain, maxDeg = 0.008): WatchArea | null {
  let best: WatchArea | null = null;
  let bestD = maxDeg;
  for (const a of terrain.areas) {
    if (a.lat == null || a.lng == null) continue;
    const d = Math.hypot(lat - a.lat, lng - a.lng);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

export function bindWatchToStands(area: WatchArea, marks: MapMark[]): WatchArea {
  if (area.lat == null || area.lng == null || !marks.length) return area;
  let best: MapMark | null = null;
  let bestD = 0.0045;
  for (const m of marks) {
    if (m.kind !== "stand") continue;
    const d = Math.hypot(m.lat - area.lat, m.lng - area.lng);
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  if (!best) return area;
  const standName = best.name.trim();
  if (area.name.toLowerCase().includes(standName.toLowerCase())) return area;
  return { ...area, name: `${standName} · ${area.name}` };
}

export function loadFarmMarks(farm: Farm): MapMark[] {
  const stored = clipMarks(farm.id, farm.lat, farm.lng, loadMarks(farm.id));
  if (stored.length) return stored;
  if (hasMarksStore(farm.id)) return [];
  const recs = recommendedMarks(farm);
  if (recs.length) saveMarks(recs, farm.id);
  return recs;
}
