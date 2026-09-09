import { makeHuntCall, type SitWindow } from "@/data/hunt-call";
import { kindLabel } from "@/data/farm-terrain";
import type { MapMark } from "@/data/marks";
import { useFarm } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather-context";
import { useMemo } from "react";

export function HuntCallCard({ marks, sitWindow }: { marks?: MapMark[]; sitWindow: SitWindow }) {
  const { weather } = useWeather();
  const { active } = useFarm();
  const sits = useMemo(() => marks ?? [], [marks]);

  const call = makeHuntCall(weather, sits, active, sitWindow);
  const hunt = call.verdict === "HUNT";
  const watch = call.watch;
  const checks = call.checklist;
  const passed = checks.filter((c) => c.ok).length;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-deep px-4 py-3">
        <p className="font-display text-xs tracking-[0.2em] text-accent">
          {call.window.toUpperCase()} · PHASE {call.phase.id || "0"}
        </p>
        <p className="mt-1 font-display text-lg uppercase tracking-wide text-fg">{call.phase.name}</p>
        <p className="mt-1 text-xs text-muted">{call.phase.window}</p>
        <p className="mt-2 text-sm leading-relaxed text-fg">{call.phase.hunt}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{call.phase.buck}</p>
      </div>

      <div className={`rounded-md border p-4 ${hunt ? "border-good bg-raised" : "border-accent bg-raised"}`}>
        <p className="font-display text-xs tracking-[0.2em] text-accent">THE CALL</p>
        <p className="mt-1 font-display text-3xl uppercase tracking-wide text-fg">
          {hunt ? `Hunt ${call.huntName}` : "Do not hunt"}
        </p>
        {call.huntWindow ? <p className="mt-1 text-sm text-good">{call.huntWindow}</p> : null}
        <p className="mt-3 text-sm leading-relaxed text-muted">{call.huntWhy}</p>
      </div>

      <div className="rounded-md border border-border bg-bg p-4">
        <p className="font-display text-xs tracking-[0.2em] text-accent">ACTION PLAN</p>
        <p className="mt-2 text-sm leading-relaxed text-fg">{call.action}</p>
      </div>

      <div className="rounded-md border border-border bg-bg p-4">
        <p className="font-display text-xs tracking-[0.2em] text-accent">SIT CHECK</p>
        <p className={`mt-1 text-xs ${passed === checks.length ? "text-muted" : "text-poor"}`}>
          {passed} of {checks.length} gates open. Any fail stays in the truck.
        </p>
        <ul className="mt-3 space-y-2">
          {checks.map((item) => (
            <li key={item.text} className="flex gap-2 text-sm leading-relaxed">
              <span className={`mt-0.5 font-display text-xs tracking-wide ${item.ok ? "text-good" : "text-poor"}`}>
                {item.ok ? "GO" : "NO"}
              </span>
              <span className={item.ok ? "text-fg" : "text-muted"}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {call.noStands ? (
        <div className="rounded-md border border-accent bg-bg p-4">
          <p className="font-display text-xs tracking-[0.2em] text-accent">STANDS</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">
            {active.name} has no named sits yet. Papa Bob, GaGa, Pine Thicket — those stay on the Anson farm.
            Open MAP, tap ADD STAND, drop it, name it. This brief will rank those names only.
          </p>
        </div>
      ) : null}

      {watch ? (
        <div className="rounded-md border border-good bg-raised p-4">
          <p className="font-display text-xs tracking-[0.2em] text-good">WATCH THIS</p>
          <p className="mt-1 font-display text-xl uppercase tracking-wide text-fg">{watch.name}</p>
          <p className="mt-1 text-xs tracking-[0.16em] text-accent">{kindLabel(watch.kind)}</p>
          <p className="mt-3 text-sm leading-relaxed text-fg">{watch.why}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <span className="text-accent">Look for: </span>
            {watch.lookFor}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <span className="text-accent">Camera: </span>
            {watch.camera}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <span className="text-accent">Access: </span>
            {watch.access}
          </p>
          <p className="mt-2 text-xs text-muted">
            Play wind {watch.favored.join(", ")} · Kill wind {watch.kill.join(", ")}
          </p>
        </div>
      ) : null}

      {call.watchAlso.length ? (
        <div className="rounded-md border border-border bg-bg p-4">
          <p className="font-display text-xs tracking-[0.2em] text-fair">ALSO KEEP AN EYE ON</p>
          <ul className="mt-3 space-y-3">
            {call.watchAlso.map((a) => (
              <li key={a.id}>
                <p className="font-display text-sm uppercase tracking-wide text-fg">
                  {a.name} <span className="text-muted">· {kindLabel(a.kind)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.why}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-bg p-3">
          <p className="font-display text-xs tracking-[0.16em] text-good">HUNT THIS</p>
          <p className="mt-1 text-sm text-fg">
            {call.huntName ?? (call.noStands ? "Drop stands on MAP first." : "Nothing. Stay out of the timber.")}
          </p>
        </div>
        <div className="rounded-md border border-border bg-bg p-3">
          <p className="font-display text-xs tracking-[0.16em] text-fair">HOLD — DON’T BURN</p>
          <p className="mt-1 text-sm text-fg">{call.hold.length ? call.hold.join(" · ") : "—"}</p>
        </div>
        <div className="rounded-md border border-border bg-bg p-3">
          <p className="font-display text-xs tracking-[0.16em] text-poor">DO NOT HUNT</p>
          <p className="mt-1 text-sm text-fg">{call.avoid.length ? call.avoid.join(" · ") : "—"}</p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-bg p-4">
        <p className="font-display text-xs tracking-[0.2em] text-accent">HOW THE BRAIN DECIDED</p>
        <ul className="mt-3 space-y-3">
          {call.layers.map((layer) => (
            <li key={layer.label}>
              <p className="font-display text-xs tracking-[0.16em] text-fair">{layer.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{layer.line}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-border bg-bg p-4">
        <p className="font-display text-xs tracking-[0.2em] text-accent">HOW THIS FARM IS BUILT</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{call.terrainThesis}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{call.lateSummer}</p>
      </div>

      <p className="text-sm text-muted">
        <span className="font-display tracking-wide text-accent">NEXT REAL HUNT </span>
        {call.nextHunt}
      </p>
    </div>
  );
}
