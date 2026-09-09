import type { Rating } from "@/data/briefing";

const tone: Record<Rating, string> = {
  Excellent: "text-good",
  "Very Good": "text-good",
  Good: "text-good",
  Fair: "text-fair",
  Poor: "text-poor",
};

export function RatingPill({ value }: { value: Rating }) {
  return <span className={`font-display text-lg font-semibold tracking-wide ${tone[value]}`}>{value.toUpperCase()}</span>;
}
