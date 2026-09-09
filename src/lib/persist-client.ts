import { HOME_FARM, loadActiveFarmId, loadFarms, mergeSeededFarms, saveActiveFarmId, saveFarms } from "@/data/farms";
import { SHARE_MODE } from "@/data/share-mode";
import { clipMarks, loadMarks, marksForFarm, saveMarks } from "@/data/marks";
import { clipOverlays, loadOverlays, saveOverlays } from "@/data/overlays";
import { loadAllLockedPins, loadLockedPins, saveAllLockedPins, saveLockedPins } from "@/data/property";
import { loadHuntbriefState, saveHuntbriefState, type HuntbriefState } from "@/lib/huntbrief-state";

let timer: ReturnType<typeof setTimeout> | null = null;
let didHydrate = false;
let lastJson = "";

export function applyServerState(state: HuntbriefState) {
  if (SHARE_MODE) return;
  const farms = mergeSeededFarms(state.farms);
  saveFarms(farms);
  saveActiveFarmId(state.activeId || "home");
  const byFarm = state.lockedPinsByFarm || { home: state.lockedPins || [] };
  saveAllLockedPins(byFarm);
  if (state.lockedPins?.length) saveLockedPins(state.lockedPins, "home");
  for (const [farmId, marks] of Object.entries(state.marks || {})) {
    const farm = farms.find((f) => f.id === farmId);
    const clipped = farm
      ? clipMarks(farmId, farm.lat, farm.lng, marks || [])
      : marksForFarm(farmId, marks || []);
    saveMarks(clipped, farmId);
  }
  for (const [farmId, overlays] of Object.entries(state.overlays || {})) {
    const farm = farms.find((f) => f.id === farmId);
    saveOverlays(farm ? clipOverlays(farm.lat, farm.lng, overlays || []) : overlays || [], farmId);
  }
}

export function snapshotState(): HuntbriefState {
  const farms = loadFarms();
  const marks: HuntbriefState["marks"] = {
    home: clipMarks(HOME_FARM.id, HOME_FARM.lat, HOME_FARM.lng, loadMarks("home")),
  };
  for (const f of farms) {
    if (f.id === "home") continue;
    marks[f.id] = clipMarks(f.id, f.lat, f.lng, loadMarks(f.id));
  }
  const lockedPinsByFarm = loadAllLockedPins();
  const overlays: HuntbriefState["overlays"] = {
    home: clipOverlays(HOME_FARM.lat, HOME_FARM.lng, loadOverlays("home")),
  };
  for (const f of farms) {
    if (f.id === "home") continue;
    overlays[f.id] = clipOverlays(f.lat, f.lng, loadOverlays(f.id));
  }
  return {
    updatedAt: Date.now(),
    farms,
    activeId: loadActiveFarmId(),
    marks,
    overlays,
    lockedPins: lockedPinsByFarm.home || loadLockedPins("home"),
    lockedPinsByFarm,
  };
}

function hasLocalMarks() {
  try {
    return Boolean(
      localStorage.getItem("huntbrief-marks-home") ||
        localStorage.getItem("huntbrief-marks-v3") ||
        localStorage.getItem("huntbrief-marks-v2"),
    );
  } catch {
    return false;
  }
}

export async function hydrateFromServer(): Promise<HuntbriefState> {
  if (didHydrate) return snapshotState();
  didHydrate = true;
  const state = await loadHuntbriefState();
  if (!hasLocalMarks()) applyServerState(state);
  else {
    for (const [farmId, marks] of Object.entries(state.marks || {})) {
      if (farmId === "home") continue;
      const farm = mergeSeededFarms(state.farms).find((f) => f.id === farmId);
      if (!farm) continue;
      const local = clipMarks(farmId, farm.lat, farm.lng, loadMarks(farmId));
      if (!local.length && marks?.length) {
        saveMarks(clipMarks(farmId, farm.lat, farm.lng, marks), farmId);
      }
    }
    saveFarms(mergeSeededFarms(state.farms));
    if (state.activeId) saveActiveFarmId(state.activeId);
    if (state.lockedPinsByFarm) {
      saveAllLockedPins({ ...loadAllLockedPins(), ...state.lockedPinsByFarm });
    }
    for (const [farmId, overlays] of Object.entries(state.overlays || {})) {
      const farm = mergeSeededFarms(state.farms).find((f) => f.id === farmId);
      if (!farm) continue;
      const local = clipOverlays(farm.lat, farm.lng, loadOverlays(farmId));
      if (!local.length && overlays?.length) {
        saveOverlays(clipOverlays(farm.lat, farm.lng, overlays), farmId);
      }
    }
  }
  return snapshotState();
}

export function schedulePush() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const snap = snapshotState();
    const json = JSON.stringify({
      farms: snap.farms,
      activeId: snap.activeId,
      marks: snap.marks,
      overlays: snap.overlays,
      lockedPins: snap.lockedPins,
      lockedPinsByFarm: snap.lockedPinsByFarm,
    });
    if (json === lastJson) return;
    lastJson = json;
    void saveHuntbriefState({ data: snap }).catch(() => {});
  }, 500);
}
