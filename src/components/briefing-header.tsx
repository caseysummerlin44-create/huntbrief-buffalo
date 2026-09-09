import { briefing } from "@/data/briefing";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

export function BriefingHeader() {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <img
        src="/huntbrief-header.jpg"
        alt="HuntBrief — Daily Deer Intelligence"
        className="h-[220px] w-full object-cover object-center sm:h-[320px] lg:h-[420px]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-center font-display text-sm tracking-[0.28em] text-fg sm:text-base">
          {todayLabel() || briefing.dateLabel}
        </p>
      </div>
    </header>
  );
}