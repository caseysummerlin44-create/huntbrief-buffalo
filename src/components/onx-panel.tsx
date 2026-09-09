import type { RefObject } from "react";
import { overlayKindLabel, type ImportResult } from "@/lib/gpx-kml";
import type { MapOverlay } from "@/data/overlays";
import type { MarkKind } from "@/data/marks";
import { Download, Trash2, Upload } from "lucide-react";

type Props = {
  open: boolean;
  onToggle: () => void;
  farmName: string;
  waypointKind: MarkKind;
  onWaypointKind: (k: MarkKind) => void;
  overlays: MapOverlay[];
  showOverlays: boolean;
  onShowOverlays: (v: boolean) => void;
  onPickFile: () => void;
  onSample: () => void;
  onExportGpx: () => void;
  onExportKml: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  note: string;
  last?: ImportResult | null;
  fileRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
};

export function OnxPanel({
  open,
  onToggle,
  farmName,
  waypointKind,
  onWaypointKind,
  overlays,
  showOverlays,
  onShowOverlays,
  onPickFile,
  onSample,
  onExportGpx,
  onExportKml,
  onDelete,
  onClear,
  note,
  last,
  fileRef,
  onFile,
}: Props) {
  return (
    <div className="rounded-md border border-border bg-raised">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-11 w-full items-center justify-between px-3 font-display text-[11px] tracking-[0.16em] text-fg"
      >
        <span>ONX HUNT · GPX / KML</span>
        <span className="text-muted">{open ? "HIDE" : "OPEN"}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
          <p className="text-muted">
            onX does not sell a map SDK. Their satellite, parcels, tree spots, and 3D LiDAR cannot be
            embedded here. Partner apps (Horus, Moultrie) only drop waypoints <em>into</em> onX — not
            the other way.
          </p>
          <p className="text-fg">
            What works today: export My Content from onX as GPX or KML, drop it on{" "}
            <span className="text-accent">{farmName}</span>, and HuntBrief turns waypoints into stands,
            lines into access, and shapes into plots. Export this farm back to onX the same way.
          </p>
          <p className="text-xs text-muted">
            onX app: My Content → Select → Export GPX. Web map: My Content → Export KML (needed for
            food-plot shapes). Files under 4 MB.
          </p>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onWaypointKind("stand")}
              className={`min-h-11 rounded-md px-3 font-display text-[11px] tracking-[0.12em] ${waypointKind === "stand" ? "bg-accent text-bg" : "border border-border text-muted"}`}
            >
              WAYPOINTS = STANDS
            </button>
            <button
              type="button"
              onClick={() => onWaypointKind("sign")}
              className={`min-h-11 rounded-md px-3 font-display text-[11px] tracking-[0.12em] ${waypointKind === "sign" ? "bg-accent text-bg" : "border border-border text-muted"}`}
            >
              WAYPOINTS = SIGN
            </button>
            <button
              type="button"
              onClick={() => onShowOverlays(!showOverlays)}
              className={`min-h-11 rounded-md px-3 font-display text-[11px] tracking-[0.12em] ${showOverlays ? "bg-accent text-bg" : "border border-border text-muted"}`}
            >
              {showOverlays ? "TRACKS ON" : "TRACKS OFF"}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".gpx,.kml,.xml,application/gpx+xml,application/vnd.google-earth.kml+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.currentTarget.value = "";
            }}
          />

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={onPickFile}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-3 font-display text-[11px] tracking-[0.12em] text-bg"
            >
              <Upload className="size-4" />
              IMPORT ONX FILE
            </button>
            <button
              type="button"
              onClick={onSample}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 font-display text-[11px] tracking-[0.12em] text-muted"
            >
              LOAD SAMPLE
            </button>
            <button
              type="button"
              onClick={onExportGpx}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 font-display text-[11px] tracking-[0.12em] text-muted"
            >
              <Download className="size-4" />
              EXPORT GPX
            </button>
            <button
              type="button"
              onClick={onExportKml}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 font-display text-[11px] tracking-[0.12em] text-muted"
            >
              <Download className="size-4" />
              EXPORT KML
            </button>
          </div>

          {note ? <p className="font-display text-xs tracking-[0.08em] text-accent">{note}</p> : null}
          {last ? (
            <p className="text-xs text-muted">
              +{last.addedStands} stands · {last.updatedStands} updated · +{last.addedSigns} sign · +
              {last.addedOverlays} tracks/shapes
              {last.skipped ? ` · ${last.skipped} too far from this farm` : ""}
            </p>
          ) : null}

          {overlays.length ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="font-display text-[11px] tracking-[0.16em] text-muted">IMPORTED LAYERS</p>
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 font-display text-[10px] tracking-[0.12em] text-poor"
                >
                  <Trash2 className="size-3.5" />
                  CLEAR
                </button>
              </div>
              <ul className="max-h-40 space-y-1 overflow-auto">
                {overlays.map((o) => (
                  <li key={o.id} className="flex min-h-9 items-center gap-2 rounded border border-border px-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: o.color }} />
                    <span className="min-w-0 flex-1 truncate">{o.name}</span>
                    <span className="shrink-0 font-display text-[10px] tracking-[0.12em] text-muted">
                      {overlayKindLabel(o.kind)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(o.id)}
                      className="shrink-0 font-display text-[10px] tracking-[0.12em] text-poor"
                      aria-label={`Remove ${o.name}`}
                    >
                      DEL
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted">No tracks or shapes on this farm yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
