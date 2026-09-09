import { useFarm } from "@/lib/farm-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FarmSwitcher() {
  const { farms, active, setActive } = useFarm();

  function cycle(dir: -1 | 1) {
    if (farms.length < 2) return;
    const i = Math.max(0, farms.findIndex((f) => f.id === active.id));
    const next = farms[(i + dir + farms.length) % farms.length];
    setActive(next.id);
  }

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-2 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => cycle(-1)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted disabled:opacity-40"
          aria-label="Previous farm"
          disabled={farms.length < 2}
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {farms.map((f) => {
            const on = f.id === active.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-md border px-3 font-display text-xs uppercase tracking-[0.12em] ${
                  on ? "border-accent bg-raised text-fg" : "border-border bg-bg text-muted"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => cycle(1)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted disabled:opacity-40"
          aria-label="Next farm"
          disabled={farms.length < 2}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
