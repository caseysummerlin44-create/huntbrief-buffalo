import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PropertyMap } from "@/components/property-map";
import { briefing } from "@/data/briefing";
import { BriefingHeader } from "@/components/briefing-header";
import { RatingPill } from "@/components/ui/rating-pill";
import { WeatherPanel } from "@/components/weather-panel";
import { WeatherProvider, useWeather } from "@/lib/weather-context";

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <p className="font-display text-[11px] tracking-[0.22em] text-accent">{kicker}</p>
      <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-raised px-3 py-3 text-center">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-1 text-fg">{children}</div>
    </div>
  );
}

const barTone = ["bg-deep", "bg-border", "bg-fair", "bg-good"];

export function BriefingPage() {
  return (
    <WeatherProvider>
      <BriefingBody />
    </WeatherProvider>
  );
}

function BriefingBody() {
  const [recsOn, setRecsOn] = useState(true);
  const { weather } = useWeather();
  const wind = weather?.windLabel ?? briefing.wind;
  const pressure = weather?.pressureLabel ?? briefing.pressure;
  const high = weather ? Math.round(weather.highF) : briefing.high;
  const low = weather ? Math.round(weather.lowF) : briefing.low;
  const sky = weather?.hours[0]?.sky ?? briefing.precipNote;

  return (
    <div className="min-h-screen bg-bg pb-16 text-fg">
      <BriefingHeader />

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-6">
        <Section kicker="01" title="Executive Snapshot">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="LEGAL WINDOW">
              <p className="font-display text-base font-semibold">
                {briefing.legalStart} – {briefing.legalEnd}
              </p>
            </Stat>
            <Stat label="WIND">
              <p className="font-display text-sm font-semibold leading-tight">{wind}</p>
            </Stat>
            <Stat label="PRESSURE">
              <p className="font-display text-base font-semibold">{pressure}</p>
            </Stat>
            <Stat label="DAY RATING">
              <RatingPill value={briefing.dayRating} />
            </Stat>
          </div>
          <p className="mt-4 border-l-4 border-accent bg-raised px-4 py-3 text-sm leading-relaxed">
            {weather
              ? `${sky}. ${wind}. ${weather.pressureCall} Scent blows ${weather.scentTo}. Hunt the sits ranked on the map — they use this live wind, not a canned SW day.`
              : `Hot pre-season day. Light southwest to variable wind. Mature bucks will move early
            and late. Best play is north and northwest stands that keep scent out of the primary
            bedding while watching travel toward soybeans and the food plots.`}
          </p>
        </Section>

        <Section kicker="MAP" title="Farm Map">
          <PropertyMap />
        </Section>

        <Section kicker="02" title="24-Hour Deer Movement">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="MORNING">
              <RatingPill value={briefing.movement.morning} />
            </Stat>
            <Stat label="MIDDAY">
              <RatingPill value={briefing.movement.midday} />
            </Stat>
            <Stat label="EVENING">
              <RatingPill value={briefing.movement.evening} />
            </Stat>
          </div>
          <p className="mt-4 text-xs tracking-wide text-muted">Relative activity timeline</p>
          <div className="mt-2 flex h-9 overflow-hidden rounded-sm">
            {briefing.movement.bars.map((b) => (
              <div
                key={b.label}
                className={`flex flex-1 items-center justify-center text-[10px] font-bold ${barTone[b.level]} ${b.level <= 1 ? "text-muted" : "text-bg"}`}
              >
                {b.label}
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-fg">
            <li>
              <strong className="text-accent">5:45–9:30 AM:</strong> Highest window. Bucks leaving
              points and benches toward soybeans and food plots.
            </li>
            <li>
              <strong className="text-accent">10 AM–4:30 PM:</strong> Heat pushes deer into shade
              and thick cover.
            </li>
            <li>
              <strong className="text-accent">5:30–8:30 PM:</strong> Strong second window. Same
              stand family remains primary.
            </li>
          </ul>
        </Section>

        <Section kicker="03" title="Stand Recommendations">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Toggle the detailed recommendation panel</p>
            <button
              type="button"
              onClick={() => setRecsOn((v) => !v)}
              className={`min-h-11 rounded-md px-4 font-display text-xs tracking-[0.16em] ${recsOn ? "bg-accent text-bg" : "border border-border bg-raised text-muted"}`}
              aria-pressed={recsOn}
            >
              {recsOn ? "RECOMMENDATIONS ON" : "RECOMMENDATIONS OFF"}
            </button>
          </div>

          {recsOn ? (
            <div className="space-y-4">
              <div className="border-l-4 border-accent bg-raised px-4 py-3 text-sm leading-relaxed">
                <strong className="text-accent">PRIMARY:</strong> {briefing.primary.join(", ")}.
                Light SW to variable wind favors the north and northwest side of bedding and
                travel toward the soybeans and upper food plot.
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wide text-fg">Why these stands</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>Mature bucks bed on elevated points and benches.</li>
                  <li>
                    Papa Bob Stand and GaGa Woods Stand intercept that movement while scent
                    drifts away from core bedding.
                  </li>
                  <li>Braswell Midway is the clean secondary angle on the same flow.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wide text-fg">Secondary</h3>
                <p className="mt-1 text-sm">{briefing.secondary.join(" · ")}</p>
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wide text-fg">Caution / avoid</h3>
                <p className="mt-1 text-sm">
                  {briefing.caution.join(" · ")} — lower elevation, rising thermals, and swirl
                  once the day heats up.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Recommendation panel hidden. Snapshot, weather, legal window, and the map remain
              available.
            </p>
          )}
        </Section>

        <Section kicker="04" title="Live Wind & Barometer">
          <WeatherPanel />
        </Section>

        <Section kicker="05" title="7-Day Hunt Outlook">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  weather?.days?.length
                    ? weather.days.map((d) => ({ day: d.name.replace("This ", ""), hi: d.hi ?? 0, lo: d.lo ?? 0 }))
                    : briefing.week
                }
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="#3a4334" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#9a8f76", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9a8f76", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#161b14",
                    border: "1px solid #3a4334",
                    color: "#c8bc9e",
                  }}
                />
                <Area type="monotone" dataKey="hi" stroke="#c45c18" fill="#c45c18" fillOpacity={0.25} name="High" />
                <Area type="monotone" dataKey="lo" stroke="#7a9b48" fill="#7a9b48" fillOpacity={0.2} name="Low" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-deep text-accent">
                <tr>
                  <th className="px-3 py-2 font-display font-medium">Day</th>
                  <th className="px-3 py-2 font-display font-medium">Hi / Lo</th>
                  <th className="px-3 py-2 font-display font-medium">Wind</th>
                  <th className="px-3 py-2 font-display font-medium">Sky</th>
                </tr>
              </thead>
              <tbody>
                {(weather?.days?.length
                  ? weather.days.map((d) => ({
                      day: d.name,
                      hi: d.hi,
                      lo: d.lo,
                      wind: d.wind,
                      sky: d.sky,
                    }))
                  : briefing.week.map((d) => ({
                      day: d.day,
                      hi: d.hi,
                      lo: d.lo,
                      wind: d.wind,
                      sky: d.note,
                    }))
                ).map((d, i) => (
                  <tr key={d.day} className={i % 2 ? "bg-raised" : undefined}>
                    <td className="px-3 py-2">{d.day}</td>
                    <td className="px-3 py-2">
                      {d.hi ?? "—"}° / {d.lo ?? "—"}°
                    </td>
                    <td className="px-3 py-2">{d.wind}</td>
                    <td className="px-3 py-2 text-muted">{d.sky}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 border-l-4 border-accent bg-raised px-4 py-3 text-sm leading-relaxed">
            <strong className="text-accent">Week strategy:</strong> Pre-season. Confirm which
            named stands actually play light SW flow. Sunday’s northwest wind may open Upper
            Creeks, Drews, and Bottom Creek. Do not burn the best stands — rotate lightly.
          </p>
        </Section>

        <Section kicker="06" title="Legal Shooting Window">
          <p className="text-sm leading-relaxed">
            North Carolina rule: 30 minutes before sunrise to 30 minutes after sunset.
          </p>
          <p className="mt-2 font-display text-xl text-accent">
            {briefing.legalStart} – {briefing.legalEnd}
          </p>
          <p className="mt-2 text-sm text-muted">
            Sunrise {briefing.sunrise} · Sunset {briefing.sunset}
          </p>
          <p className="mt-3 text-sm">{briefing.seasonNote}</p>
        </Section>

        <Section kicker="07" title="Wind & Thermal Detail">
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong className="text-accent">Now:</strong> {wind}. Scent blows {weather?.scentTo ?? "SE"}.
              Thermals still matter in the creek — don’t sit Bottom Creek unless the wind is a hard north.
            </li>
            <li>
              <strong className="text-accent">Pressure:</strong> {pressure}. {weather?.pressureCall ?? briefing.pressure}
            </li>
            <li>
              <strong className="text-accent">Heat:</strong> High {high}° / Low {low}°. Midday is a dead zone until it cools.
            </li>
          </ul>
        </Section>

        <Section kicker="08" title="Food & Habitat Status">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="bg-deep text-accent">
                <tr>
                  <th className="px-3 py-2 font-display font-medium">Feature</th>
                  <th className="px-3 py-2 font-display font-medium">Status</th>
                  <th className="px-3 py-2 font-display font-medium">Implication</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">Large AG fields</td>
                  <td className="px-3 py-2">Soybeans (2026)</td>
                  <td className="px-3 py-2">Primary daytime attractant</td>
                </tr>
                <tr className="border-b border-border bg-raised">
                  <td className="px-3 py-2">Upper / Lower Food Plot</td>
                  <td className="px-3 py-2">Active fall plots</td>
                  <td className="px-3 py-2">Secondary but important</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">Hardwoods / mast</td>
                  <td className="px-3 py-2">Early — limited drop</td>
                  <td className="px-3 py-2">Not yet a major pull</td>
                </tr>
                <tr className="bg-raised">
                  <td className="px-3 py-2">Creek bottoms / points</td>
                  <td className="px-3 py-2">Cool travel + bedding</td>
                  <td className="px-3 py-2">Morning and evening source</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section kicker="09" title="Today’s Action Plan">
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong className="text-accent">Best single sit:</strong> Be in Papa Bob Stand or
              GaGa Woods Stand before legal light. Stay until at least 9:30–10:00 AM.
            </p>
            <p>
              <strong className="text-accent">Morning + evening:</strong> Same stand family both
              times unless the wind clocks or storms force a move.
            </p>
            <p>
              <strong className="text-accent">Intelligence goal:</strong> Confirm how mature bucks
              are using the soybean edges and which named stands actually play a light SW wind.
            </p>
          </div>
        </Section>

        <p className="pt-2 text-center text-xs tracking-wide text-muted">
          HuntBrief · Mossy Oak Bottomland · 13 named stands locked · Mature buck focus
        </p>
      </div>
    </div>
  );
}
