import { makeHuntCall, type SitWindow } from "@/data/hunt-call";
import { loadFarmMarks } from "@/data/farm-terrain";
import { useFarm } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather-context";
import { useMemo } from "react";

export function FleetCalls({ sitWindow }: { sitWindow: SitWindow }) {
  const { farms, active, setActive, ready } = useFarm();
  const { byFarm } = useWeather();

  const rows = useMemo(
    () =>
      farms.map((farm) => {
        const marks = loadFarmMarks(farm);
        const call = makeHuntCall(byFarm[farm.id] ?? null, marks, farm, sitWindow);
        return { farm, call };
      }),
    [farms, byFarm, sitWindow],
  );

  if (!ready || farms.length < 2) return null;

  return (
    <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <p className="font-display text-xs tracking-[0.22em] text-accent">ALL FARMS · {sitWindow.toUpperCase()}</p>
      <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Same pull. Different dirt.</h2>
      <p className="mt-1 text-sm text-muted">
        Every farm on this account updates together. Tap one to open its briefing. Anson names never land on Buffalo
        Creek.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map(({ farm, call }) => {
          const on = farm.id === active.id;
          const hunt = call.verdict === "HUNT";
          return (
            <li key={farm.id}>
              <button
                type="button"
                onClick={() => setActive(farm.id)}
                className={`w-full rounded-md border px-3 py-3 text-left ${on ? "border-accent bg-raised" : "border-border bg-bg"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-sm uppercase tracking-wide text-fg">{farm.name}</p>
                  <p className={`font-display text-xs tracking-[0.14em] ${hunt ? "text-good" : "text-accent"}`}>
                    {hunt ? `HUNT ${call.huntName}` : "DO NOT HUNT"}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {byFarm[farm.id]?.windLabel ?? "Pulling wind…"}
                  {call.watch ? ` · watch ${call.watch.name.split("—")[0].trim()}` : ""}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
