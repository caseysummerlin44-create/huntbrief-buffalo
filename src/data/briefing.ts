export type Rating = "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";

export type Stand = {
  id: string;
  name: string;
  zone: string;
};

export const STANDS: Stand[] = [
  { id: "adams-bench", name: "Adams Creek bench", zone: "North timber" },
  { id: "buffalo-terrace", name: "Dutch Buffalo terrace", zone: "East creek" },
  { id: "long-plot", name: "Interior long plot", zone: "Food" },
  { id: "staging-pocket", name: "Timber staging pocket", zone: "Staging" },
  { id: "ridge-ponds", name: "West ridge ponds", zone: "Water" },
  { id: "powerline-pinch", name: "Powerline pinch", zone: "Funnel" },
];

export const briefing = {
  dateLabel: "Thursday, August 20, 2026",
  property: "Buffalo Creek Hunt Club · Cabarrus County, NC",
  coords: "35.375361, –80.433417",
  legalStart: "6:15 AM",
  legalEnd: "8:34 PM",
  sunrise: "6:45 AM",
  sunset: "8:04 PM",
  wind: "Light SW–Variable 3–7 mph",
  pressure: "Steady",
  dayRating: "Fair" as Rating,
  high: 97,
  low: 72,
  precipNote: "Mostly sunny, afternoon storm chance",
  seasonNote:
    "Pre-season. Archery opens September 12, 2026. Treat every sit as intelligence gathering for opening day.",
  movement: {
    morning: "Good" as Rating,
    midday: "Fair" as Rating,
    evening: "Good" as Rating,
    bars: [
      { label: "12a", level: 1 },
      { label: "3a", level: 1 },
      { label: "6a", level: 2 },
      { label: "9a", level: 3 },
      { label: "12p", level: 2 },
      { label: "3p", level: 1 },
      { label: "6p", level: 3 },
      { label: "9p", level: 2 },
    ],
  },
  primary: ["Adams Creek bench", "Timber staging pocket", "West ridge ponds"],
  secondary: ["Dutch Buffalo terrace", "Interior long plot", "Powerline pinch"],
  caution: ["Preserve edge field"],
  week: [
    { day: "Thu 20", hi: 97, lo: 72, wind: "SW–Var", quality: "Fair", note: "Hot + storm risk PM" },
    { day: "Fri 21", hi: 94, lo: 71, wind: "S–SE", quality: "Fair", note: "Storms more likely" },
    { day: "Sat 22", hi: 90, lo: 70, wind: "Variable", quality: "Fair", note: "Watch wind shift" },
    { day: "Sun 23", hi: 91, lo: 68, wind: "NW", quality: "Good", note: "Better for east stands" },
    { day: "Mon 24", hi: 90, lo: 68, wind: "N–Var", quality: "Good", note: "Continue pattern watch" },
    { day: "Tue 25", hi: 90, lo: 68, wind: "Variable", quality: "Fair", note: "Hold best sits" },
    { day: "Wed 26", hi: 89, lo: 69, wind: "S–SW", quality: "Fair", note: "Back to north-side" },
  ],
};
