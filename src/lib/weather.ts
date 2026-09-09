/** Live farm weather — KAFP ASOS barometer + NWS hourly. */

export const FARM_WX = {
  lat: 35.37536,
  lng: -80.43342,
  station: "KJQF",
  stationName: "Concord-Padgett",
  grid: "GSP/116,70",
};

const CARDINALS8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export type Cardinal8 = (typeof CARDINALS8)[number];

export type PressureTrend = "rising" | "falling" | "steady";

export type WxObs = {
  time: string;
  tempF: number | null;
  windDeg: number | null;
  windMph: number | null;
  gustMph: number | null;
  pressureInHg: number | null;
  humidity: number | null;
  condition: string;
};

export type WxHour = {
  time: string;
  label: string;
  tempF: number;
  windMph: number;
  windDir: string;
  gustMph: number | null;
  precipChance: number;
  sky: string;
};

export type WxDay = {
  name: string;
  hi: number | null;
  lo: number | null;
  wind: string;
  sky: string;
};

export type FarmWeather = {
  fetchedAt: string;
  stationId: string;
  current: WxObs;
  trend3h: PressureTrend;
  delta3h: number | null;
  hours: WxHour[];
  days: WxDay[];
  highF: number;
  lowF: number;
  quarters: Cardinal8[];
  recentQuarters: Cardinal8[];
  windLabel: string;
  pressureLabel: string;
  pressureCall: string;
  scentTo: string;
};

const HEADERS = { Accept: "application/geo+json, application/ld+json" };

function kmhToMph(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return null;
  return v * 0.621371;
}

function cToF(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return null;
  return (v * 9) / 5 + 32;
}

function paToInHg(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return null;
  return v / 3386.389;
}

export function cardinal8(deg: number | null | undefined): Cardinal8 | null {
  if (deg == null || Number.isNaN(deg)) return null;
  return CARDINALS8[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function oppositeCardinal(c: Cardinal8): Cardinal8 {
  const i = CARDINALS8.indexOf(c);
  return CARDINALS8[(i + 4) % 8];
}

function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "object" && v && "value" in v) {
    const n = (v as { value: unknown }).value;
    return typeof n === "number" && Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseWindSpeed(s: string | null | undefined): number {
  if (!s) return 0;
  const parts = s.match(/[\d.]+/g)?.map(Number) ?? [0];
  return parts[parts.length - 1] ?? 0;
}

async function nws<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 301) {
    const loc = res.headers.get("location");
    if (loc) return nws<T>(new URL(loc, url).toString());
  }
  if (!res.ok) throw new Error(`Weather ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

type NwsObs = {
  timestamp?: string;
  textDescription?: string;
  temperature?: { value: number | null };
  windDirection?: { value: number | null };
  windSpeed?: { value: number | null };
  windGust?: { value: number | null };
  barometricPressure?: { value: number | null };
  relativeHumidity?: { value: number | null };
};

function readObs(p: NwsObs): WxObs {
  return {
    time: p.timestamp || new Date().toISOString(),
    tempF: cToF(num(p.temperature)),
    windDeg: num(p.windDirection),
    windMph: kmhToMph(num(p.windSpeed)),
    gustMph: kmhToMph(num(p.windGust)),
    pressureInHg: paToInHg(num(p.barometricPressure)),
    humidity: num(p.relativeHumidity),
    condition: p.textDescription || "—",
  };
}

function fmtHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", timeZone: "America/New_York" });
}

export async function fetchFarmWeather(lat = FARM_WX.lat, lng = FARM_WX.lng): Promise<FarmWeather> {
  const pointUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`;
  const point = await nws<{
    properties: {
      forecastHourly: string;
      forecast: string;
      observationStations: string;
    };
  }>(pointUrl);

  const stations = await nws<{ features: { properties: { stationIdentifier?: string } }[] }>(
    point.properties.observationStations,
  );
  const station = stations.features[0]?.properties?.stationIdentifier || FARM_WX.station;
  const obsUrl = `https://api.weather.gov/stations/${station}/observations?limit=18`;
  const hourlyUrl = point.properties.forecastHourly;
  const dailyUrl = point.properties.forecast;

  const [obsJ, hourlyJ, dailyJ] = await Promise.all([
    nws<{ features: { properties: NwsObs }[] }>(obsUrl),
    nws<{
      properties: {
        periods: {
          startTime: string;
          temperature: number;
          windSpeed: string;
          windDirection: string;
          shortForecast: string;
          probabilityOfPrecipitation?: { value: number | null };
        }[];
      };
    }>(hourlyUrl),
    nws<{
      properties: {
        periods: {
          name: string;
          isDaytime: boolean;
          temperature: number;
          windSpeed: string;
          windDirection: string;
          shortForecast: string;
        }[];
      };
    }>(dailyUrl),
  ]);

  const history = (obsJ.features || [])
    .map((f) => readObs(f.properties))
    .filter((o) => o.pressureInHg != null);
  const current = history[0] || readObs({});

  const t0 = new Date(current.time).getTime();
  const target = t0 - 3 * 3600 * 1000;
  let prior: WxObs | null = null;
  let best = Infinity;
  for (const o of history) {
    const d = Math.abs(new Date(o.time).getTime() - target);
    if (d < best) {
      best = d;
      prior = o;
    }
  }
  const delta3h =
    current.pressureInHg != null && prior?.pressureInHg != null
      ? current.pressureInHg - prior.pressureInHg
      : null;
  const trend3h: PressureTrend =
    delta3h == null ? "steady" : delta3h >= 0.03 ? "rising" : delta3h <= -0.03 ? "falling" : "steady";

  const hours: WxHour[] = (hourlyJ.properties.periods || []).slice(0, 24).map((p) => ({
    time: p.startTime,
    label: fmtHour(p.startTime),
    tempF: p.temperature,
    windMph: parseWindSpeed(p.windSpeed),
    windDir: p.windDirection,
    gustMph: null,
    precipChance: p.probabilityOfPrecipitation?.value ?? 0,
    sky: p.shortForecast,
  }));

  const days: WxDay[] = [];
  const periods = dailyJ.properties.periods || [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    if (p.isDaytime) {
      const night = periods[i + 1] && !periods[i + 1].isDaytime ? periods[i + 1] : null;
      days.push({
        name: p.name,
        hi: p.temperature,
        lo: night?.temperature ?? null,
        wind: `${p.windDirection} ${p.windSpeed}`,
        sky: p.shortForecast,
      });
    }
  }

  const highF = Math.max(current.tempF ?? 0, ...hours.map((h) => h.tempF));
  const lowF = days[0]?.lo ?? Math.min(...hours.map((h) => h.tempF));

  const nowQ = cardinal8(current.windDeg);
  const recentQuarters = Array.from(
    new Set(
      history
        .slice(0, 6)
        .map((o) => cardinal8(o.windDeg))
        .filter((c): c is Cardinal8 => !!c),
    ),
  );
  const quarters: Cardinal8[] = nowQ ? [nowQ] : recentQuarters.slice(0, 1);

  const mph = current.windMph != null ? Math.round(current.windMph) : 0;
  const gust = current.gustMph != null ? Math.round(current.gustMph) : null;
  const windLabel = nowQ
    ? `${nowQ} ${mph} mph${gust ? ` gust ${gust}` : ""}`
    : `Calm / variable`;

  const inHg = current.pressureInHg;
  const pressureLabel =
    inHg != null
      ? `${inHg.toFixed(2)} inHg · ${trend3h}${delta3h != null ? ` ${delta3h >= 0 ? "+" : ""}${delta3h.toFixed(2)}` : ""}`
      : "—";

  const pressureCall =
    trend3h === "rising"
      ? "Rising barometer. Movement often picks up — hunt the play wind."
      : trend3h === "falling" && (delta3h ?? 0) <= -0.08
        ? "Fast drop. Weather change. Deer can move ahead of it, then shut down."
        : trend3h === "falling"
          ? "Slow fall — normal afternoon. Don’t overread it."
          : "Steady pressure. Wind is the deciding factor.";

  const scentTo = nowQ ? oppositeCardinal(nowQ) : "—";

  return {
    fetchedAt: new Date().toISOString(),
    stationId: station,
    current,
    trend3h,
    delta3h,
    hours,
    days: days.slice(0, 7),
    highF,
    lowF,
    quarters,
    recentQuarters,
    windLabel,
    pressureLabel,
    pressureCall,
    scentTo,
  };
}

const wxMemo = new Map<string, { at: number; wx: FarmWeather }>();

export function wxCacheKey(lat: number, lng: number) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export async function fetchFarmWeatherCached(
  lat: number,
  lng: number,
  opts?: { force?: boolean },
): Promise<FarmWeather> {
  const key = wxCacheKey(lat, lng);
  const hit = wxMemo.get(key);
  if (!opts?.force && hit && Date.now() - hit.at < 90_000) return hit.wx;
  const wx = await fetchFarmWeather(lat, lng);
  wxMemo.set(key, { at: Date.now(), wx });
  return wx;
}
