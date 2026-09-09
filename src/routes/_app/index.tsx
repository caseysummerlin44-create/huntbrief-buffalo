import { FleetCalls } from "@/components/fleet-calls";
import { HuntCallCard } from "@/components/hunt-call-card";
import { WeatherPanel } from "@/components/weather-panel";
import { briefing } from "@/data/briefing";
import { loadFarmMarks } from "@/data/farm-terrain";
import { phaseFor } from "@/data/knowledge-bank";
import { dayHuntQuality, sitWindowNow, BRIEFING_CLOCK, type SitWindow } from "@/data/hunt-call";
import { legalHours } from "@/lib/solar";
import { useFarm } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather-context";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: TodayPage,
});

function clockLabel(iso: string | null) {
  if (!iso) return "Pulling live wind…";
  return (
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    }) + " ET · all farms"
  );
}

function TodayPage() {
  const { weather, fetchedAt, refresh, loading } = useWeather();
  const { active } = useFarm();
  const [sit, setSit] = useState<SitWindow>(() => sitWindowNow());
  const marks = loadFarmMarks(active);
  const wind = weather?.windLabel ?? briefing.wind;
  const pressure = weather?.pressureLabel ?? briefing.pressure;
  const phase = useMemo(() => phaseFor(), []);
  const legal = useMemo(() => legalHours(active.lat, active.lng), [active.lat, active.lng]);
  const seasonNote =
    phase.id <= 0
      ? "Pre-season. Archery opens September 12, 2026. Intel, not hero sits."
      : phase.id <= 3
        ? `NC archery opens September 12. Phase ${phase.id} — ${phase.name}. Evenings and fringe until the first stacked front.`
        : `NC Central Zone. ${phase.name}. Legal hours: 30 minutes before sunrise to 30 minutes after sunset.`;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">TODAY</p>
        <h1 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Hunt call</h1>
        <p className="mt-1 text-xs text-muted">
          {active.name} · Phase {phase.id || "0"} {phase.name} · {clockLabel(fetchedAt)}
          {loading ? " · refreshing" : ""}
        </p>
        <p className="mt-1 text-xs text-muted">
          Email {BRIEFING_CLOCK.morning} and {BRIEFING_CLOCK.afternoon} ET. App is live whenever you open it.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["morning", "afternoon"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSit(w)}
              className={`min-h-11 rounded-md border font-display text-xs uppercase tracking-[0.16em] ${
                sit === w ? "border-accent bg-raised text-fg" : "border-border bg-bg text-muted"
              }`}
              aria-pressed={sit === w}
            >
              {w} · {BRIEFING_CLOCK[w]}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="WIND">{wind}</Stat>
          <Stat label="SCENT TO">{weather?.scentTo ?? "—"}</Stat>
          <Stat label="BAROMETER">{pressure}</Stat>
          <Stat label="LEGAL">
            {legal.startLabel} – {legal.endLabel}
          </Stat>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          Sunrise {legal.sunriseLabel} · Sunset {legal.sunsetLabel} · 30 minutes before / after
        </p>
        <button
          type="button"
          onClick={refresh}
          className="mt-3 min-h-11 w-full rounded-md border border-border font-display text-xs tracking-[0.14em] text-muted"
        >
          UPDATE CURRENT CONDITIONS
        </button>
        <div className="mt-4">
          <HuntCallCard marks={marks} sitWindow={sit} />
        </div>
      </section>

      <FleetCalls sitWindow={sit} />

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">WEATHER</p>
        <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Live wind & barometer</h2>
        <div className="mt-4">
          <WeatherPanel />
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">WEEK</p>
        <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Outlook</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="bg-deep text-accent">
              <tr>
                <th className="px-3 py-2 font-display font-medium">Day</th>
                <th className="px-3 py-2 font-display font-medium">Hi / Lo</th>
                <th className="px-3 py-2 font-display font-medium">Wind</th>
                <th className="px-3 py-2 font-display font-medium">Hunt</th>
              </tr>
            </thead>
            <tbody>
              {(weather?.days?.length ? weather.days : []).slice(0, 7).map((d, i) => {
                const q = dayHuntQuality(d.hi, d.wind, (d.hi ?? 90) >= 88, phase.id <= 3);
                return (
                  <tr key={d.name} className={i % 2 ? "bg-raised" : undefined}>
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">
                      {d.hi ?? "—"}° / {d.lo ?? "—"}°
                    </td>
                    <td className="px-3 py-2">{d.wind}</td>
                    <td className="px-3 py-2">
                      <span className="font-display text-xs tracking-wide text-fg">{q.quality}</span>
                      <span className="mt-0.5 block text-xs text-muted">{q.note}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">{seasonNote}</p>
      </section>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-raised px-3 py-3 text-center">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-1 font-display text-sm text-fg">{children}</div>
    </div>
  );
}
