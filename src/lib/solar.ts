/** NC shooting hours: 30 minutes before sunrise to 30 minutes after sunset. */

const TZ = "America/New_York";

function civilDate(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: n("year"), month: n("month"), day: n("day") };
}

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** NOAA / Wikipedia sunrise equation. Times are Date objects (UTC instants). */
export function sunTimes(lat: number, lng: number, at: Date = new Date()) {
  const { year, month, day } = civilDate(at);
  const n = Math.ceil(
    (Date.UTC(year, month - 1, day) - Date.UTC(2000, 0, 1, 12)) / 86_400_000,
  );
  const Jstar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const MRad = toRad(M);
  const C = 1.9148 * Math.sin(MRad) + 0.02 * Math.sin(2 * MRad) + 0.0003 * Math.sin(3 * MRad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(MRad) - 0.0069 * Math.sin(2 * toRad(lambda));
  const sinDec = Math.sin(toRad(lambda)) * Math.sin(toRad(23.4397));
  const dec = Math.asin(sinDec);
  const latRad = toRad(lat);
  const cosHa =
    (Math.sin(toRad(-0.83)) - Math.sin(latRad) * sinDec) / (Math.cos(latRad) * Math.cos(dec));
  const ha = toDeg(Math.acos(Math.min(1, Math.max(-1, cosHa))));
  const jr = Jtransit - ha / 360;
  const js = Jtransit + ha / 360;
  const julianToDate = (j: number) => new Date((j - 2440587.5) * 86_400_000);
  return { sunrise: julianToDate(jr), sunset: julianToDate(js) };
}

export function formatEtTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function legalHours(lat: number, lng: number, at: Date = new Date()) {
  const { sunrise, sunset } = sunTimes(lat, lng, at);
  const start = new Date(sunrise.getTime() - 30 * 60_000);
  const end = new Date(sunset.getTime() + 30 * 60_000);
  return {
    sunrise,
    sunset,
    start,
    end,
    startLabel: formatEtTime(start),
    endLabel: formatEtTime(end),
    sunriseLabel: formatEtTime(sunrise),
    sunsetLabel: formatEtTime(sunset),
  };
}
