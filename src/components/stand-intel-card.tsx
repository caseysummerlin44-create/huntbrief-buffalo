import { RatingPill } from "@/components/ui/rating-pill";
import type { MapMark } from "@/data/marks";
import { scoreStand } from "@/data/stand-intel";
import { useFarm } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather-context";

function Bar({ label, pct }: { label: string; pct: number }) {
  const tone = pct >= 70 ? "bg-good" : pct >= 45 ? "bg-fair" : "bg-poor";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="text-fg">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-deep">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StandIntelCard({ mark }: { mark: MapMark }) {
  const { weather } = useWeather();
  const { active } = useFarm();
  const live = weather
    ? { quarters: weather.quarters, recent: weather.recentQuarters, label: weather.windLabel, highF: weather.highF }
    : null;
  const intel = scoreStand(mark, live, active);
  if (!intel) {
    return (
      <p className="text-sm text-muted">Signs don’t get a hunt score. Switch to a stand.</p>
    );
  }

  const gate =
    intel.windGate === "play"
      ? "WIND PLAY"
      : intel.windGate === "kill"
        ? "WIND KILL"
        : "WIND CAUTION";

  const gateTone =
    intel.windGate === "play" ? "text-good" : intel.windGate === "kill" ? "text-poor" : "text-fair";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs tracking-[0.18em] text-accent">HUNT POTENTIAL</p>
          <h3 className="font-display text-xl uppercase tracking-wide text-fg">{mark.name}</h3>
          <p className="text-sm text-muted">{intel.profile.role}</p>
        </div>
        <div className="text-right">
          <RatingPill value={intel.rating} />
          <p className="font-display text-2xl text-fg">{intel.percent}%</p>
        </div>
      </div>

      <p className="border-l-4 border-accent bg-bg px-3 py-2 text-sm leading-relaxed">{intel.call}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-bg px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] text-muted">WIND</p>
          <p className="text-sm text-fg">{intel.wind}</p>
          <p className={`mt-1 font-display text-xs ${gateTone}`}>{gate}</p>
        </div>
        <div className="rounded-md border border-border bg-bg px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] text-muted">BEST TIME</p>
          <p className="text-sm text-fg">{intel.bestTime}</p>
        </div>
        <div className="rounded-md border border-border bg-bg px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] text-muted">PLAY WINDS</p>
          <p className="text-sm text-fg">{intel.profile.favored.join(", ")}</p>
        </div>
        <div className="rounded-md border border-border bg-bg px-3 py-2">
          <p className="text-[10px] tracking-[0.16em] text-muted">KILL WINDS</p>
          <p className="text-sm text-fg">{intel.profile.kill.join(", ")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Bar label="Morning activity" pct={intel.morningPct} />
        <Bar label="Midday activity" pct={intel.middayPct} />
        <Bar label="Evening activity" pct={intel.eveningPct} />
      </div>

      <p className="text-sm leading-relaxed text-muted">{intel.profile.why}</p>
      <p className="text-xs text-muted">
        Score: base {intel.math.base}
        {intel.math.briefing ? ` · briefing ${intel.math.briefing > 0 ? "+" : ""}${intel.math.briefing}` : ""}
        {intel.math.wind ? ` · wind ${intel.math.wind > 0 ? "+" : ""}${intel.math.wind}` : ""}
        {intel.math.heat ? ` · heat ${intel.math.heat}` : ""}
        {" = "}
        {intel.percent}%. Not a tracker — rules for this wind, this stand, this day.
      </p>
    </div>
  );
}
