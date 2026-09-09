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

const PROFILES: Record<string, StandProfile> = {};

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
