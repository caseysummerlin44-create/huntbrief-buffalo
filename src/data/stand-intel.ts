import { briefing, type Rating } from "@/data/briefing";
import type { Farm } from "@/data/farms";
import { kindLabel, nearestWatch, terrainFor, type WatchArea, type WatchKind } from "@/data/farm-terrain";
import type { MapMark } from "@/data/marks";
import type { Cardinal8 } from "@/lib/weather";

export type WindGate = "play" | "caution" | "kill";

export type LiveHuntWx = {
  quarters: Cardinal8[];
  recent: Cardinal8[];
  label: string;
  highF: number;
};

export type StandProfile = {
  id: string;
  role: string;
  favored: string[];
  kill: string[];
  morning: string;
  evening: string;
  why: string;
  kind?: WatchKind;
};

const PROFILES: Record<string, StandProfile> = {
  pine: {
    id: "pine",
    role: "North timber / staging",
    favored: ["SW", "W", "S"],
    kill: ["N", "NE"],
    morning: "6:15–9:30 AM",
    evening: "6:00–8:34 PM",
    why: "Covers bucks sliding south out of the thicket toward soybeans. SW keeps scent off the bed.",
  },
  "braswell-mid": {
    id: "braswell-mid",
    role: "Mid-north intercept",
    favored: ["SW", "S", "W"],
    kill: ["N", "NE"],
    morning: "6:15–9:30 AM",
    evening: "5:30–8:30 PM",
    why: "Clean angle on the same north-side flow. Best secondary if Papa Bob is burned.",
  },
  "braswell-back": {
    id: "braswell-back",
    role: "Northeast timber",
    favored: ["S", "SW", "W"],
    kill: ["N", "NE", "E"],
    morning: "6:15–9:00 AM",
    evening: "6:00–8:34 PM",
    why: "Playable on SW but scent can leak toward the creek finger. Sit only if the wind stays south of west.",
  },
  "papa-bob": {
    id: "papa-bob",
    role: "West-central bedding intercept",
    favored: ["SW", "W", "NW", "S"],
    kill: ["E", "NE"],
    morning: "6:15–10:00 AM",
    evening: "5:30–8:34 PM",
    why: "Primary mature-buck sit. Elevated timber watching travel to soybeans with SW scent off the bed.",
  },
  gaga: {
    id: "gaga",
    role: "West timber / field edge",
    favored: ["SW", "W", "S"],
    kill: ["E", "NE"],
    morning: "6:15–9:30 AM",
    evening: "5:30–8:34 PM",
    why: "Same family as Papa Bob. SW-variable lets you hunt the west edge without blowing the core.",
  },
  "upper-plot": {
    id: "upper-plot",
    role: "Food plot edge",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE"],
    morning: "6:15–8:30 AM",
    evening: "6:30–8:34 PM",
    why: "Evening food sit. Today’s SW is marginal — scent can blow into the plot. Better after a north shift.",
  },
  "lower-plot": {
    id: "lower-plot",
    role: "Lower plot / east edge",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE", "SW"],
    morning: "6:15–8:00 AM",
    evening: "6:30–8:34 PM",
    why: "SW pushes scent across the plot into the creek timber. Hold this for a north wind.",
  },
  "upper-creek": {
    id: "upper-creek",
    role: "Eastern creek funnel",
    favored: ["N", "NW"],
    kill: ["S", "SW", "W"],
    morning: "6:15–8:30 AM",
    evening: "6:00–8:00 PM",
    why: "Creek funnel is a thermal trap. SW plus falling evening thermals = busted. Do not hunt today.",
  },
  marty: {
    id: "marty",
    role: "South-central field",
    favored: ["N", "NE", "E"],
    kill: ["S", "SW"],
    morning: "6:15–8:30 AM",
    evening: "6:00–8:34 PM",
    why: "Looks at the field from the south. SW puts your scent into the soybeans deer want to use.",
  },
  "papa-darin": {
    id: "papa-darin",
    role: "Southeast interior",
    favored: ["N", "NE", "NW"],
    kill: ["S", "SW"],
    morning: "6:15–9:00 AM",
    evening: "5:30–8:00 PM",
    why: "Interior timber. SW is the wrong quarter. Save it for a north wind after the front.",
  },
  drew: {
    id: "drew",
    role: "Southeast creek timber",
    favored: ["N", "NW"],
    kill: ["S", "SW", "W"],
    morning: "6:15–8:30 AM",
    evening: "Avoid",
    why: "Low, tight to the creek. Thermals + SW = scent pool. Hunt only on a hard north.",
  },
  "bottom-creek": {
    id: "bottom-creek",
    role: "Lower creek corridor",
    favored: ["N", "NW"],
    kill: ["S", "SW", "W", "SE"],
    morning: "Avoid",
    evening: "Avoid",
    why: "Worst sit on a hot SW day. Scent and thermals collect in the bottom. Leave it alone.",
  },
  "papa-hill": {
    id: "papa-hill",
    role: "Southern point / hill",
    favored: ["N", "NE", "E"],
    kill: ["S", "SW"],
    morning: "6:15–9:00 AM",
    evening: "5:30–8:00 PM",
    why: "Herndon point. Needs a north or east wind so scent falls off the hill away from the approach.",
  },
  "adams-bench": {
    id: "adams-bench",
    role: "Adams Creek bedding ridge",
    favored: ["SW", "S", "W"],
    kill: ["N", "NE", "E"],
    morning: "6:15–9:30 AM",
    evening: "Avoid",
    why: "LiDAR bedding. South-facing drop into Adams Creek. SW/W only. Do not walk the crest.",
  },
  "buffalo-terrace": {
    id: "buffalo-terrace",
    role: "Dutch Buffalo travel terrace",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE", "SW"],
    morning: "6:15–8:30 AM",
    evening: "Avoid",
    why: "First terrace above the creek, not the water. Hold on any south wind.",
  },
  "long-plot": {
    id: "long-plot",
    role: "Destination food / cameras",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE", "SW"],
    morning: "Avoid",
    evening: "6:30–8:34 PM",
    why: "Camera plot. Sit only on a north wind after it cools. Heat + south wind = cards only.",
  },
  "staging-pocket": {
    id: "staging-pocket",
    role: "Timber staging opening",
    favored: ["W", "SW", "NW"],
    kill: ["E", "SE"],
    morning: "6:15–9:00 AM",
    evening: "5:30–7:30 PM",
    why: "Only daylight sit in this heat if the wind is west. Hunt the edge, not the hole.",
  },
  "ridge-ponds": {
    id: "ridge-ponds",
    role: "August water",
    favored: ["SW", "W", "S"],
    kill: ["N", "E"],
    morning: "6:15–8:30 AM",
    evening: "6:30–8:34 PM",
    why: "LiDAR ponds on the 550-ft ridge. Water beats food in 90°. Camera first. Sit only on SW/W.",
  },
  "powerline-pinch": {
    id: "powerline-pinch",
    role: "Powerline timber pinch",
    favored: ["N", "NW", "W"],
    kill: ["S", "SW"],
    morning: "6:15–8:30 AM",
    evening: "Avoid",
    why: "Crossers, not line-walkers. North/west wind. Don’t walk the right-of-way.",
  },
  pops: {
    id: "pops",
    role: "West ridge / ponds",
    favored: ["SW", "W", "S"],
    kill: ["N", "E"],
    morning: "6:15–9:00 AM",
    evening: "6:30–8:34 PM",
    why: "LiDAR: Pops sits the west 550-ft ridge by the ponds. August water. SW/W keeps scent off Adams Creek beds.",
    kind: "water",
  },
  oldenburg: {
    id: "oldenburg",
    role: "North timber / preserve pressure",
    favored: ["SW", "S", "W"],
    kill: ["N", "NE"],
    morning: "6:15–9:00 AM",
    evening: "Avoid",
    why: "LiDAR: north of Adams Creek toward Oldenburg / houses. Sanctuary-edge sit. Don’t hunt it on a north wind — you’ll blow the ridge beds.",
    kind: "bedding",
  },
  "top-hedgerow": {
    id: "top-hedgerow",
    role: "Adams Creek bench intercept",
    favored: ["SW", "S", "W"],
    kill: ["N", "NE", "E"],
    morning: "6:15–9:30 AM",
    evening: "Avoid",
    why: "LiDAR: Top Hedgerow is the Adams Creek bench. Primary mature-buck intercept. SW/W only. Do not walk the crest.",
    kind: "bedding",
  },
  "bottom-straw": {
    id: "bottom-straw",
    role: "East straw field / creek staging",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE", "SW"],
    morning: "6:15–8:30 AM",
    evening: "6:00–8:00 PM",
    why: "LiDAR: Bottom Straw Field sits the east interior toward Dutch Buffalo. Staging off the creek terrace. Hold on a south wind.",
    kind: "staging",
  },
  "dry-pond": {
    id: "dry-pond",
    role: "Interior dry pond",
    favored: ["SW", "W", "N"],
    kill: ["E", "SE"],
    morning: "6:15–8:30 AM",
    evening: "6:30–8:34 PM",
    why: "LiDAR: interior water hole near the pin. In this heat it’s a camera. Sit only if the pond still holds water and the wind is west.",
    kind: "water",
  },
  "hedgerow-bottom": {
    id: "hedgerow-bottom",
    role: "Lower hedgerow / creek terrace",
    favored: ["N", "NW", "W"],
    kill: ["S", "SE", "SW"],
    morning: "6:15–8:30 AM",
    evening: "Avoid",
    why: "LiDAR: Hedgerow Bottom is the drop toward Dutch Buffalo. Thermal sink at last light. North/west wind or leave it.",
    kind: "funnel",
  },
  road: {
    id: "road",
    role: "West road access sit",
    favored: ["SW", "W", "S"],
    kill: ["N", "E"],
    morning: "6:15–8:30 AM",
    evening: "5:30–8:00 PM",
    why: "LiDAR: Road Stand is the west access off Mallou / Mount Pleasant. Easy in, easy to bump. Short sits. SW/W.",
    kind: "funnel",
  },
};

const FALLBACK_WIND = ["SW", "S", "W"];

function normName(s: string) {
  return s.toLowerCase().replace(/\bstand\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function windowsFor(kind?: WatchKind) {
  if (kind === "food") return { morning: "Avoid", evening: "6:30–8:34 PM" };
  if (kind === "bedding") return { morning: "6:15–9:30 AM", evening: "Avoid" };
  if (kind === "funnel") return { morning: "6:15–8:30 AM", evening: "Avoid" };
  if (kind === "water") return { morning: "6:15–8:30 AM", evening: "6:30–8:34 PM" };
  return { morning: "6:15–9:30 AM", evening: "5:30–8:34 PM" };
}

function fromWatch(mark: MapMark, area: WatchArea): StandProfile {
  const win = windowsFor(area.kind);
  return {
    id: area.id,
    role: `${kindLabel(area.kind)} · ${area.name}`,
    favored: area.favored,
    kill: area.kill,
    morning: win.morning,
    evening: win.evening,
    why: `${mark.name.trim()} sits the ${area.name.toLowerCase()}. ${area.why}`,
    kind: area.kind,
  };
}

function profileFor(mark: MapMark, farm?: Farm): StandProfile {
  if (PROFILES[mark.id]) return PROFILES[mark.id];
  const n = normName(mark.name);
  const hit = Object.values(PROFILES).find((p) => n === p.id.replace(/-/g, " ") || n.includes(p.id.replace(/-/g, " ")));
  if (hit) return hit;
  if (n.includes("pop")) return PROFILES.pops;
  if (n.includes("oldenburg")) return PROFILES.oldenburg;
  if (n.includes("top") && n.includes("hedge")) return PROFILES["top-hedgerow"];
  if (n.includes("straw")) return PROFILES["bottom-straw"];
  if (n.includes("dry") && n.includes("pond")) return PROFILES["dry-pond"];
  if (n.includes("hedge") && n.includes("bottom")) return PROFILES["hedgerow-bottom"];
  if (n === "road" || n.endsWith(" road")) return PROFILES.road;

  const terrain = terrainFor(farm || { id: "pin", name: mark.name, lat: mark.lat, lng: mark.lng });
  const area = nearestWatch(mark.lat, mark.lng, terrain);
  if (area) return fromWatch(mark, area);

  return {
    id: mark.id,
    role: "User stand",
    favored: ["N", "NW", "W"],
    kill: ["S"],
    morning: "6:15–9:30 AM",
    evening: "5:30–8:34 PM",
    why: "No nearby LiDAR feature. Score uses live wind only — drop it on known terrain or lock the farm.",
  };
}

function ratingFromScore(n: number): Rating {
  if (n >= 80) return "Excellent";
  if (n >= 70) return "Very Good";
  if (n >= 58) return "Good";
  if (n >= 42) return "Fair";
  return "Poor";
}

function activity(score: number, window: "morning" | "midday" | "evening") {
  const heat = window === "midday" ? 0.45 : window === "morning" ? 1 : 0.92;
  return Math.max(8, Math.min(96, Math.round(score * heat)));
}

export type StandIntel = {
  profile: StandProfile;
  rating: Rating;
  percent: number;
  windGate: WindGate;
  wind: string;
  morningPct: number;
  middayPct: number;
  eveningPct: number;
  bestTime: string;
  call: string;
  math: { base: number; briefing: number; wind: number; heat: number };
};

export function scoreStand(
  mark: MapMark,
  live?: LiveHuntWx | null,
  farm?: Farm,
  window: "morning" | "afternoon" = "morning",
): StandIntel | null {
  if (mark.kind !== "stand") return null;
  const profile = profileFor(mark, farm);

  const quarters = live?.quarters?.length ? live.quarters : FALLBACK_WIND;
  const play = profile.favored.some((w) => (quarters as string[]).includes(w));
  const kill = profile.kill.some((w) => (quarters as string[]).includes(w));
  const high = live?.highF ?? briefing.high;
  const windLabel = live?.label ?? briefing.wind;

  const base = 52;
  const briefingAdj = live
    ? 0
    : briefing.primary.includes(mark.name)
      ? 22
      : briefing.secondary.includes(mark.name)
        ? 10
        : briefing.caution.includes(mark.name)
          ? -18
          : 0;
  const windAdj = kill && !play ? -24 : play && !kill ? 24 : play && kill ? -4 : 0;
  const heatAdj = high >= 90 ? -6 : high >= 80 ? -2 : 0;
  const score = Math.max(10, Math.min(94, base + briefingAdj + windAdj + heatAdj));

  const windGate: WindGate = kill && !play ? "kill" : play ? "play" : "caution";
  const morningPct = activity(score, "morning");
  const middayPct = activity(score, "midday");
  const eveningPct = activity(score, "evening");
  const best = window === "afternoon" ? profile.evening : profile.morning;

  const call =
    windGate === "kill"
      ? "Do not hunt this sit today."
      : windGate === "play"
        ? "Hunt it. Wind and movement both work."
        : "Marginal. Only if the wind holds in a favored quarter.";

  return {
    profile,
    rating: ratingFromScore(score),
    percent: score,
    windGate,
    wind: windLabel,
    morningPct,
    middayPct,
    eveningPct,
    bestTime: best,
    call,
    math: { base, briefing: briefingAdj, wind: windAdj, heat: heatAdj },
  };
}
