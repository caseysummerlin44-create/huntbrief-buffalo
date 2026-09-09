import { type FarmWeather } from "@/lib/weather";
import { useWeather } from "@/lib/weather-context";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function WindRose({ deg, label }: { deg: number | null; label: string }) {
  const rot = deg == null ? 0 : deg;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="h-32 w-32 text-fg">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#3a4334" strokeWidth="2" />
        <circle cx="60" cy="60" r="4" fill="#c45c18" />
        {["N", "E", "S", "W"].map((c, i) => {
          const a = (i * Math.PI) / 2;
          const x = 60 + Math.sin(a) * 44;
          const y = 60 - Math.cos(a) * 44;
          return (
            <text
              key={c}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#9a8f76"
              fontSize="10"
              fontFamily="Oswald, sans-serif"
            >
              {c}
            </text>
          );
        })}
        {deg != null ? (
          <g transform={`rotate(${rot} 60 60)`}>
            <polygon points="60,14 66,40 60,34 54,40" fill="#c45c18" />
            <line x1="60" y1="34" x2="60" y2="88" stroke="#c8bc9e" strokeWidth="2" />
            <polygon points="60,96 65,82 55,82" fill="#c8bc9e" />
          </g>
        ) : null}
      </svg>
      <p className="font-display text-sm tracking-wide text-fg">{label}</p>
      <p className="text-[10px] tracking-[0.16em] text-muted">ARROW = WIND FROM</p>
    </div>
  );
}

export function WeatherPanel() {
  const { weather, loading, error, refresh } = useWeather();

  if (loading && !weather) {
    return <p className="text-sm text-muted">Reading live NWS wind and station barometer for every farm…</p>;
  }
  if (error && !weather) {
    return (
      <p className="text-sm text-poor">
        Weather did not load. {error}{" "}
        <button type="button" className="underline" onClick={refresh}>
          Retry
        </button>
      </p>
    );
  }
  if (!weather) return null;

  return <LiveWeather wx={weather} onRefresh={refresh} />;
}

function LiveWeather({ wx, onRefresh }: { wx: FarmWeather; onRefresh: () => void }) {
  const p = wx.current;
  const trendTone =
    wx.trend3h === "rising" ? "text-good" : wx.trend3h === "falling" ? "text-fair" : "text-fg";
  const pressurePts = wx.hours.map((h) => ({
    label: h.label,
    wind: h.windMph,
    temp: h.tempF,
    precip: h.precipChance,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-bg p-3">
          <WindRose deg={p.windDeg} label={wx.windLabel} />
          <p className="mt-2 text-center text-xs text-muted">
            Scent blows <span className="text-accent">{wx.scentTo}</span>
          </p>
        </div>
        <div className="rounded-md border border-border bg-bg p-4">
          <p className="text-[10px] tracking-[0.16em] text-muted">BAROMETER · {wx.stationId || "NWS"}</p>
          <p className="mt-1 font-display text-3xl text-fg">
            {p.pressureInHg != null ? p.pressureInHg.toFixed(2) : "—"}
            <span className="ml-1 text-base text-muted">inHg</span>
          </p>
          <p className={`mt-1 font-display text-sm uppercase ${trendTone}`}>
            {wx.trend3h}
            {wx.delta3h != null ? ` ${wx.delta3h >= 0 ? "+" : ""}${wx.delta3h.toFixed(2)} / 3h` : ""}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{wx.pressureCall}</p>
          <p className="mt-2 text-[10px] text-muted">{wx.stationId} ASOS — real instrument, not a model.</p>
        </div>
        <div className="rounded-md border border-border bg-bg p-4">
          <p className="text-[10px] tracking-[0.16em] text-muted">NOW ON THE FARM</p>
          <p className="mt-1 font-display text-3xl text-fg">
            {p.tempF != null ? Math.round(p.tempF) : "—"}°
          </p>
          <p className="text-sm text-muted">{p.condition}</p>
          <p className="mt-3 text-sm text-fg">
            High {Math.round(wx.highF)}° / Low {Math.round(wx.lowF)}°
          </p>
          <p className="text-xs text-muted">
            {p.humidity != null ? `${Math.round(p.humidity)}% RH` : ""}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 min-h-11 w-full rounded-md border border-border font-display text-xs tracking-[0.14em] text-muted"
          >
            REFRESH
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 font-display text-[11px] tracking-[0.18em] text-accent">24-HOUR WIND + TEMP</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pressurePts} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#3a4334" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "#9a8f76", fontSize: 10 }} interval={2} />
              <YAxis tick={{ fill: "#9a8f76", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#161b14", border: "1px solid #3a4334", color: "#c8bc9e" }}
              />
              <Area type="monotone" dataKey="wind" stroke="#c45c18" fill="#c45c18" fillOpacity={0.25} name="Wind mph" />
              <Area type="monotone" dataKey="temp" stroke="#c8bc9e" fill="#c8bc9e" fillOpacity={0.12} name="Temp F" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-deep text-accent">
            <tr>
              <th className="px-3 py-2 font-display font-medium">Hour</th>
              <th className="px-3 py-2 font-display font-medium">Temp</th>
              <th className="px-3 py-2 font-display font-medium">Wind</th>
              <th className="px-3 py-2 font-display font-medium">Rain</th>
              <th className="px-3 py-2 font-display font-medium">Sky</th>
            </tr>
          </thead>
          <tbody>
            {wx.hours.slice(0, 16).map((h, i) => (
              <tr key={h.time} className={i % 2 ? "bg-raised" : undefined}>
                <td className="px-3 py-2">{h.label}</td>
                <td className="px-3 py-2">{h.tempF}°</td>
                <td className="px-3 py-2">
                  {h.windDir} {h.windMph} mph
                </td>
                <td className="px-3 py-2">{h.precipChance}%</td>
                <td className="px-3 py-2 text-muted">{h.sky}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
