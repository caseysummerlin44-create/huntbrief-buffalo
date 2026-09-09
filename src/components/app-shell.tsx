import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BriefingHeader } from "@/components/briefing-header";
import { FarmSwitcher } from "@/components/farm-switcher";
import { SHARE_MODE } from "@/data/share-mode";
import { BookOpen, Map, Sprout, Sun } from "lucide-react";

const tabs = SHARE_MODE
  ? ([
      { to: "/", label: "TODAY", icon: Sun },
      { to: "/map", label: "MAP", icon: Map },
      { to: "/field", label: "FIELD", icon: BookOpen },
    ] as const)
  : ([
      { to: "/", label: "TODAY", icon: Sun },
      { to: "/map", label: "MAP", icon: Map },
      { to: "/field", label: "FIELD", icon: BookOpen },
      { to: "/farms", label: "FARMS", icon: Sprout },
    ] as const);

function Chrome() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-bg pb-24 text-fg">
      <BriefingHeader />
      {SHARE_MODE ? (
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
            <p className="font-display text-[11px] tracking-[0.22em] text-accent">BUFFALO CREEK HUNT CLUB</p>
            <p className="mt-1 text-sm text-muted">Shared club briefing. Personal farms are not on this link.</p>
          </div>
        </div>
      ) : (
        <FarmSwitcher />
      )}
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
        <div className={`mx-auto grid max-w-5xl ${SHARE_MODE ? "grid-cols-3" : "grid-cols-4"}`}>
          {tabs.map((t) => {
            const on = t.to === "/" ? path === "/" : path.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 font-display text-xs tracking-[0.12em] ${on ? "text-accent" : "text-muted"}`}
              >
                <Icon className="size-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function AppShell() {
  return <Chrome />;
}
