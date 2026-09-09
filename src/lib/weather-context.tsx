import { useFarm } from "@/lib/farm-context";
import { fetchFarmWeatherCached, type FarmWeather } from "@/lib/weather";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type WxState = {
  weather: FarmWeather | null;
  byFarm: Record<string, FarmWeather>;
  fetchedAt: string | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
};

const WxCtx = createContext<WxState>({
  weather: null,
  byFarm: {},
  fetchedAt: null,
  error: null,
  loading: true,
  refresh: () => {},
});

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { farms, active } = useFarm();
  const [byFarm, setByFarm] = useState<Record<string, FarmWeather>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const farmsKey = farms.map((f) => `${f.id}:${f.lat.toFixed(4)},${f.lng.toFixed(4)}`).join("|");

  useEffect(() => {
    if (!farms.length) return;
    let alive = true;
    const force = tick > 0;
    setLoading(true);
    Promise.all(
      farms.map(async (f) => {
        try {
          const wx = await fetchFarmWeatherCached(f.lat, f.lng, { force });
          return [f.id, wx] as const;
        } catch {
          return [f.id, null] as const;
        }
      }),
    )
      .then((rows) => {
        if (!alive) return;
        const next: Record<string, FarmWeather> = {};
        for (const [id, wx] of rows) {
          if (wx) next[id] = wx;
        }
        setByFarm((prev) => ({ ...prev, ...next }));
        const failed = rows.filter(([, wx]) => !wx).length;
        setError(failed && !rows.some(([, wx]) => wx) ? "Weather unavailable" : null);
        setFetchedAt(new Date().toISOString());
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Weather unavailable");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tick, farms, farmsKey]);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    const id = setInterval(bump, 5 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      clearInterval(id);
    };
  }, []);

  const weather = byFarm[active.id] ?? null;
  const value = useMemo<WxState>(
    () => ({
      weather,
      byFarm,
      fetchedAt,
      error,
      loading: loading && !weather,
      refresh: () => setTick((n) => n + 1),
    }),
    [weather, byFarm, fetchedAt, error, loading],
  );

  return <WxCtx.Provider value={value}>{children}</WxCtx.Provider>;
}

export function useWeather() {
  return useContext(WxCtx);
}
