import { HOME_FARM, mergeSeededFarms, type Farm } from "@/data/farms";
import { SEEDED_STANDS, marksForFarm, type MapMark } from "@/data/marks";
import { FARM_LOCKED_PINS } from "@/data/property";
import { type MapOverlay } from "@/data/overlays";
import { createServerFn } from "@tanstack/react-start";

export type HuntbriefState = {
  updatedAt: number;
  farms: Farm[];
  activeId: string;
  marks: Record<string, MapMark[]>;
  overlays?: Record<string, MapOverlay[]>;
  lockedPins: string[];
  lockedPinsByFarm?: Record<string, string[]>;
};

const FILE = "/workspace/data/huntbrief-state.json";

function emptyState(): HuntbriefState {
  return {
    updatedAt: Date.now(),
    farms: mergeSeededFarms([]),
    activeId: "home",
    marks: { home: SEEDED_STANDS },
    overlays: {},
    lockedPins: [...FARM_LOCKED_PINS],
    lockedPinsByFarm: { home: [...FARM_LOCKED_PINS] },
  };
}

function sanitizeMarks(raw: Record<string, MapMark[]> | undefined): Record<string, MapMark[]> {
  const out: Record<string, MapMark[]> = { home: SEEDED_STANDS };
  for (const [id, marks] of Object.entries(raw || {})) {
    out[id] = marksForFarm(id, marks || []);
  }
  if (!out.home?.length) out.home = SEEDED_STANDS;
  return out;
}

export const loadHuntbriefState = createServerFn({ method: "GET" }).handler(async () => {
  const fs = await import("node:fs/promises");
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as HuntbriefState;
    if (!parsed || typeof parsed !== "object") return emptyState();
    const byFarm = parsed.lockedPinsByFarm || { home: parsed.lockedPins || FARM_LOCKED_PINS };
    return {
      ...emptyState(),
      ...parsed,
      farms: mergeSeededFarms(parsed.farms),
      marks: sanitizeMarks(parsed.marks),
      overlays: parsed.overlays || {},
      lockedPinsByFarm: byFarm,
      lockedPins: byFarm.home || parsed.lockedPins || FARM_LOCKED_PINS,
    };
  } catch {
    return emptyState();
  }
});

export const saveHuntbriefState = createServerFn({ method: "POST" })
  .validator((d: HuntbriefState) => d)
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    await fs.mkdir("/workspace/data", { recursive: true });
    const payload: HuntbriefState = {
      ...data,
      farms: mergeSeededFarms(data.farms),
      marks: sanitizeMarks(data.marks),
      updatedAt: Date.now(),
    };
    const next = JSON.stringify(
      {
        farms: payload.farms,
        activeId: payload.activeId,
        marks: payload.marks,
        overlays: payload.overlays || {},
        lockedPins: payload.lockedPins,
        lockedPinsByFarm: payload.lockedPinsByFarm,
      },
      null,
      2,
    );
    try {
      const raw = await fs.readFile(FILE, "utf8");
      const prev = JSON.parse(raw) as HuntbriefState;
      const prevJson = JSON.stringify(
        {
          farms: prev.farms,
          activeId: prev.activeId,
          marks: prev.marks,
          overlays: prev.overlays || {},
          lockedPins: prev.lockedPins,
          lockedPinsByFarm: prev.lockedPinsByFarm,
        },
        null,
        2,
      );
      if (prevJson === next) return { ok: true, updatedAt: prev.updatedAt };
    } catch {
      /* first write */
    }
    await fs.writeFile(FILE, JSON.stringify(payload, null, 2));
    return { ok: true, updatedAt: payload.updatedAt };
  });
