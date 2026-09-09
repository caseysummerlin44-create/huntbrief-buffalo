import {
  HOME_FARM,
  SEEDED_FARMS,
  isSeededFarm,
  loadActiveFarmId,
  loadFarms,
  mergeSeededFarms,
  newFarm,
  saveActiveFarmId,
  saveFarms,
  type Farm,
} from "@/data/farms";
import { initFarmMarks } from "@/data/marks";
import { SHARE_MODE } from "@/data/share-mode";
import { saveLockedPins } from "@/data/property";
import { hydrateFromServer, schedulePush } from "@/lib/persist-client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type FarmState = {
  farms: Farm[];
  active: Farm;
  ready: boolean;
  setActive: (id: string) => void;
  addFarm: (name: string, lat: number, lng: number) => Farm;
  removeFarm: (id: string) => void;
};

const FarmCtx = createContext<FarmState | null>(null);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>(SEEDED_FARMS);
  const [activeId, setActiveId] = useState("home");
  const [ready, setReady] = useState(false);

  const active = farms.find((f) => f.id === activeId) || farms[0] || HOME_FARM;

  useEffect(() => {
    let alive = true;
    const local = loadFarms();
    const localActive = loadActiveFarmId();
    setFarms(local);
    setActiveId(localActive);

    const fallback = setTimeout(() => {
      if (alive) setReady(true);
    }, 2500);
    hydrateFromServer()
      .then((s) => {
        if (!alive) return;
        setFarms(mergeSeededFarms(s.farms));
        const nextActive =
          s.activeId && mergeSeededFarms(s.farms).some((f) => f.id === s.activeId) ? s.activeId : localActive;
        setActiveId(nextActive);
        saveActiveFarmId(nextActive);
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(fallback);
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
      clearTimeout(fallback);
    };
  }, []);

  const api = useMemo<FarmState>(
    () => ({
      farms,
      active,
      ready,
      setActive(id) {
        setActiveId(id);
        saveActiveFarmId(id);
        schedulePush();
      },
      addFarm(name, lat, lng) {
        if (SHARE_MODE) return farms[0] || HOME_FARM;
        const farm = newFarm(name, lat, lng);
        initFarmMarks(farm.id);
        saveLockedPins([], farm.id);
        const next = mergeSeededFarms([...farms, farm]);
        setFarms(next);
        saveFarms(next);
        setActiveId(farm.id);
        saveActiveFarmId(farm.id);
        schedulePush();
        return farm;
      },
      removeFarm(id) {
        if (isSeededFarm(id)) return;
        const next = farms.filter((f) => f.id !== id);
        setFarms(next);
        saveFarms(next);
        if (activeId === id) {
          setActiveId("home");
          saveActiveFarmId("home");
        }
        schedulePush();
      },
    }),
    [farms, active, activeId, ready],
  );

  return <FarmCtx.Provider value={api}>{children}</FarmCtx.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmCtx);
  if (!ctx) throw new Error("useFarm needs FarmProvider");
  return ctx;
}
