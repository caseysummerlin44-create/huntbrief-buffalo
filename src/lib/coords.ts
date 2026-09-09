/** Parse decimal or DMS coords. Example: 35°22'31.3"N 80°26'00.3"W */

export type LatLng = { lat: number; lng: number };

function dmsToDec(d: number, m = 0, s = 0, hemi?: string) {
  let v = Math.abs(d) + m / 60 + s / 3600;
  if (hemi && /[SW]/i.test(hemi)) v = -v;
  if (d < 0) v = -Math.abs(v);
  return v;
}

const DMS =
  /(\d{1,3})[^\d]+(\d{1,2})[^\d]+(\d{1,2}(?:\.\d+)?)[^\d]*([NSEW])/gi;

export function parseLatLng(raw: string, lngRaw = ""): LatLng | null {
  const blob = `${raw} ${lngRaw}`.trim();
  if (!blob) return null;

  const dms = [...blob.matchAll(DMS)].map((m) =>
    dmsToDec(Number(m[1]), Number(m[2]), Number(m[3]), m[4]),
  );
  if (dms.length >= 2) {
    const hemi = [...blob.matchAll(/[NSEW]/gi)].map((x) => x[0].toUpperCase());
    let lat = dms[0];
    let lng = dms[1];
    if (hemi[0] === "E" || hemi[0] === "W") {
      lng = dms[0];
      lat = dms[1];
    }
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }

  const nums = blob
    .replace(/[°'′"″]/g, " ")
    .split(/[,\s]+/)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
  if (nums.length === 2 && Math.abs(nums[0]) <= 90 && Math.abs(nums[1]) <= 180) {
    return { lat: nums[0], lng: nums[1] };
  }
  return null;
}

export function fmtLatLng(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
