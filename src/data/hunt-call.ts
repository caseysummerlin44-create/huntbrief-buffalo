import type { Farm } from "@/data/farms";
import { HOME_FARM } from "@/data/farms";
import {
  evaluateKnowledge,
  phaseFor,
  type ChecklistItem,
  type DoctrineLayer,
  type SeasonPhase,
} from "@/data/knowledge-bank";
import { bindWatchToStands, pickWatchAreas, terrainFor, type WatchArea } from "@/data/farm-terrain";
import { HOME_STAND_NAMES, SEEDED_STANDS, marksForFarm, type MapMark } from "@/data/marks";
import { scoreStand, type StandIntel } from "@/data/stand-intel";
import type { FarmWeather } from "@/lib/weather";

const HOLD_IDS = new Set([
  "papa-bob",
  "gaga",
  "braswell-mid",
  "pine",
  "staging-pocket",
  "adams-bench",
  "ridge-ponds",
  "pops",
  "top-hedgerow",
  "dry-pond",
]);

export type SitWindow = "morning" | "afternoon";

export const BRIEFING_CLOCK = {
  morning: "4:30 AM",
  afternoon: "12:00 PM",
} as const;

export function sitWindowNow(at = new Date()): SitWindow {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/New_York",
    }).formatToParts(at).find((p) => p.type === "hour")?.value ?? 12,
  );
  return hour < 12 ? "morning" : "afternoon";
}

export type HuntCall = {
  verdict: "HUNT" | "DO NOT HUNT";
  huntName: string | null;
  huntWhy: string;
  huntWindow: string | null;
  hold: string[];
  avoid: string[];
  nextHunt: string;
  watch: WatchArea | null;
  watchAlso: WatchArea[];
  terrainThesis: string;
  lateSummer: string;
  farmName: string;
  noStands: boolean;
  phase: SeasonPhase;
  checklist: ChecklistItem[];
  layers: DoctrineLayer[];
  window: SitWindow;
  action: string;
};

function farmStands(farm: Farm, marks: MapMark[]): MapMark[] {
  const clean = marksForFarm(farm.id, marks);
  if (farm.home && !clean.length) return SEEDED_STANDS;
  return clean;
}

const ANSON_LEAK = /(?!)/;
const CABARRUS_LEAK =
  /adams creek|dutch buffalo|pops|oldenburg|hedgerow|straw field|dry pond|mallou|powerline|buffalo creek/i;

function isolateNames(farm: Farm, names: string[]) {
  const home = farm.home || farm.county === "anson";
  return names.filter((n) => {
    const low = n.toLowerCase();
    if (home) return !CABARRUS_LEAK.test(n);
    return !ANSON_LEAK.test(n) && !HOME_STAND_NAMES.has(low);
  });
}

export function makeHuntCall(
  weather: FarmWeather | null,
  marks: MapMark[] = [],
  farm: Farm = HOME_FARM,
  window: SitWindow = sitWindowNow(),
): HuntCall {
  const terrain = terrainFor(farm);
  const sits = farmStands(farm, marks);
  const live = weather
    ? {
        quarters: weather.quarters,
        recent: weather.recentQuarters,
        label: weather.windLabel,
        highF: weather.highF,
      }
    : null;

  const quarters = (weather?.quarters?.length ? weather.quarters : ["SW", "S"]) as string[];
  const nowF = weather?.current.tempF ?? weather?.highF ?? 90;
  const highF = weather?.highF ?? 90;
  const heat = window === "afternoon" ? highF >= 88 : nowF >= 88;
  const watches = pickWatchAreas(terrain, quarters, heat, window).map((a) => bindWatchToStands(a, sits));
  const watch = watches[0] ?? null;
  const watchAlso = watches.slice(1, 3);
  const noStands = !farm.home && !sits.some((m) => m.kind === "stand");
  const phase = phaseFor();
  const slotOf = (intel: StandIntel) => (window === "afternoon" ? intel.profile.evening : intel.profile.morning);

  const ranked = sits
    .filter((m) => m.kind === "stand")
    .map((mark) => ({ mark, intel: scoreStand(mark, live, farm, window) }))
    .filter((row): row is { mark: MapMark; intel: StandIntel } => !!row.intel)
    .filter((row) => slotOf(row.intel) !== "Avoid")
    .sort((a, b) => b.intel.percent - a.intel.percent);

  const plays = ranked.filter((r) => r.intel.windGate === "play");
  const kills = ranked.filter((r) => r.intel.windGate === "kill");
  const best = plays[0];

  const holdFromStands = ranked
    .filter((r) => {
      if (r.intel.windGate === "play") return false;
      const kind = r.intel.profile.kind;
      return HOLD_IDS.has(r.mark.id) || HOLD_IDS.has(r.intel.profile.id) || kind === "bedding" || kind === "water";
    })
    .map((r) => r.mark.name.trim());
  const holdFromTerrain = noStands
    ? []
    : watches
        .filter((a) => HOLD_IDS.has(a.id) && a.id !== watch?.id)
        .map((a) => a.name.split("—")[0].trim());
  const hold = isolateNames(farm, Array.from(new Set([...holdFromStands, ...holdFromTerrain])).slice(0, 3));

  const avoid = isolateNames(
    farm,
    [
      ...kills.map((r) => r.mark.name),
      ...watches
        .filter((a) => a.kill.some((w) => quarters.includes(w)) && !a.favored.some((w) => quarters.includes(w)))
        .map((a) => a.name.split("—")[0].trim()),
    ]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 4),
  );

  const nextHunt = nextPlayDay(weather);
  const windBit = weather
    ? `${weather.windLabel}. Scent blows ${weather.scentTo}. ${Math.round(window === "afternoon" ? highF : nowF)}°. ${weather.pressureCall}`
    : "Waiting on live wind.";
  const knowledge = evaluateKnowledge({
    heat,
    quarters,
    kind: watch?.kind,
    killWind: plays.length === 0 && kills.length > 0,
    phase,
    pressureRising: weather?.trend3h === "rising",
    windMph: weather?.current.windMph ?? null,
    window,
  });
  const brain = knowledge.line;
  const forcedOut = knowledge.forceNoHunt;
  const watchName = watch?.name.split("—")[0].trim() ?? "water and the first shade off food";

  const base = {
    hold: hold.length ? hold : isolateNames(farm, watchAlso.map((a) => a.name.split("—")[0].trim())),
    avoid,
    nextHunt,
    watch,
    watchAlso,
    terrainThesis: terrain.thesis,
    lateSummer: terrain.lateSummer,
    farmName: terrain.name,
    phase,
    checklist: knowledge.checklist,
    layers: knowledge.layers,
    window,
  };

  if (noStands) {
    return {
      ...base,
      verdict: "DO NOT HUNT",
      huntName: null,
      huntWhy: `${windBit} This farm has no stands yet. Drop and name them on MAP. Until then, watch the terrain below — not names from another farm. ${brain}`,
      huntWindow: null,
      hold: [],
      avoid: [],
      noStands: true,
      action: "Drop stands on MAP. Cameras until the farm has a named sit.",
    };
  }

  if (!best || heat || forcedOut) {
    const why = heat
      ? `${windBit} ${brain} If you do one thing, check ${watchName}.`
      : `${windBit} ${brain}`;
    const hotDay = highF >= 88;
    return {
      ...base,
      verdict: "DO NOT HUNT",
      huntName: null,
      huntWhy: why,
      huntWindow: null,
      noStands: false,
      action: hotDay
        ? "Cameras. Stay out of the timber. First stacked north or west front is the first real sit."
        : window === "morning" && phase.id <= 3
          ? "Stay out this morning. Fringe tonight if the wind is 7–10 mph. Do not walk a bedroom."
          : "Stay out of the timber. Hold the sanctuary. Wait for the next play wind.",
    };
  }

  return {
    ...base,
    verdict: "HUNT",
    huntName: best.mark.name,
    huntWhy: `${best.intel.call} ${best.intel.profile.why} ${brain}${watch && watch.id !== best.mark.id ? ` Next dirt that matches this wind: ${watchName}.` : ""}`,
    huntWindow: best.intel.bestTime === "Avoid" ? null : best.intel.bestTime,
    hold: hold.filter((n) => n !== best.mark.name),
    noStands: false,
    action: `Sit ${best.mark.name}${best.intel.bestTime && best.intel.bestTime !== "Avoid" ? ` · ${best.intel.bestTime}` : ""}. One sit. Leave clean.`,
  };
}

function nextPlayDay(weather: FarmWeather | null): string {
  if (!weather?.days?.length) return "Watch the next north or west wind.";
  const hit = weather.days.find((d) => /NW|N\b|W\b|SW/.test(d.wind) && !/This Afternoon|Tonight/i.test(d.name));
  if (!hit) return `${weather.days[0]?.name ?? "Soon"} — watch the wind shift.`;
  return `${hit.name} · ${hit.wind}${hit.hi ? ` · ${hit.hi}°` : ""}`;
}

export function dayHuntQuality(hi: number | null, wind: string, hotDay: boolean, early: boolean) {
  if ((hi ?? 90) >= 88 || hotDay) return { quality: "Poor", note: "Heat. Cameras." };
  if (early && !/NW|N\b/.test(wind)) return { quality: "Fair", note: "Evenings, fringe only." };
  if (/NW|N\b/.test(wind) && (hi ?? 90) <= 78) return { quality: "Good", note: "Front window. Play wind." };
  return { quality: "Fair", note: "Wind first. Don’t force a dirty sit." };
}
