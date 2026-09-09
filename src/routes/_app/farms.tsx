import { isSeededFarm } from "@/data/farms";
import { parseLatLng } from "@/lib/coords";
import { detectCounty } from "@/lib/county-gis";
import { useFarm } from "@/lib/farm-context";
import { createFileRoute } from "@tanstack/react-router";
import { LocateFixed, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/farms")({
  component: FarmsPage,
});

function FarmsPage() {
  const { farms, active, setActive, addFarm, removeFarm } = useFarm();
  const [name, setName] = useState("");
  const [coords, setCoords] = useState("");
  const [note, setNote] = useState("");

  const parsed = parseLatLng(coords);
  const county = parsed ? detectCounty(parsed.lat, parsed.lng) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pin = parseLatLng(coords);
    if (!pin) {
      setNote("Paste GPS like 35°22'31.3\"N 80°26'00.3\"W or 35.37536, -80.43342");
      return;
    }
    addFarm(name || "New farm", pin.lat, pin.lng);
    setName("");
    setCoords("");
    setNote(
      `Farm saved. Anson stand names stay on the home farm. Open MAP and drop new stands — then name them.`,
    );
  }

  function useGps() {
    if (!navigator.geolocation) {
      setNote("GPS not available.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setNote("GPS filled. Name it and save.");
      },
      () => setNote("GPS blocked — allow location, or paste coordinates."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-[11px] tracking-[0.22em] text-accent">FARMS</p>
        <h1 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Your properties</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This is your private hunt. On the Publish sheet, set Access to Just you so Anson never sits on a public
          link. Buffalo Creek has its own share app.
        </p>
        <ul className="mt-4 space-y-2">
          {farms.map((f) => (
            <li key={f.id}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActive(f.id)}
                  className={`min-h-11 flex-1 rounded-md border px-3 text-left text-sm ${active.id === f.id ? "border-accent bg-raised" : "border-border bg-bg"}`}
                >
                  <span className="font-display uppercase tracking-wide">{f.name}</span>
                  <span className="ml-2 text-xs text-muted">
                    {f.county ? `${f.county} · ` : ""}
                    {f.lat.toFixed(5)}, {f.lng.toFixed(5)}
                  </span>
                </button>
                {!isSeededFarm(f.id) ? (
                  <button
                    type="button"
                    onClick={() => removeFarm(f.id)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-poor"
                    aria-label={`Remove ${f.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-[11px] tracking-[0.22em] text-accent">ADD FARM</p>
        <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Drop a pin</h2>
        <p className="mt-2 text-sm text-muted">
          Paste degrees-minutes-seconds or decimal. Example: 35°22'31.3"N 80°26'00.3"W Cabarrus and
          Anson county GIS load automatically from the pin.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg"
              placeholder="River tract"
            />
          </label>
          <label className="block text-sm">
            Latitude / longitude
            <input
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg"
              placeholder={`35°22'31.3"N 80°26'00.3"W`}
            />
          </label>
          {parsed ? (
            <p className="text-sm text-good">
              Reads as {parsed.lat.toFixed(6)}, {parsed.lng.toFixed(6)}
              {county ? ` · ${county.name} GIS` : " · no county GIS for this pin yet"}
            </p>
          ) : coords.trim() ? (
            <p className="text-sm text-poor">Can’t read that pin yet — keep the N/W letters on it.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useGps}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-raised px-4 font-display text-xs tracking-[0.14em] text-muted"
            >
              <LocateFixed className="size-4" />
              USE MY GPS
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-md bg-accent px-5 font-display text-xs tracking-[0.14em] text-bg"
            >
              SAVE FARM
            </button>
          </div>
          {note ? <p className="text-sm text-accent">{note}</p> : null}
        </form>
      </section>
    </div>
  );
}
