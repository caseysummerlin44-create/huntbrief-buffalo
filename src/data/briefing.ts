export type Rating = "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";

export type Stand = {
  id: string;
  name: string;
  zone: string;
};

export const STANDS: Stand[] = [
  { id: "pine", name: "Pine Thicket Stand", zone: "North timber" },
  { id: "braswell-back", name: "Braswell Back", zone: "Northeast" },
  { id: "braswell-mid", name: "Braswell Midway", zone: "Mid-north" },
  { id: "papa-bob", name: "Papa Bob Stand", zone: "Central-west" },
  { id: "gaga", name: "GaGa Woods Stand", zone: "West-central timber" },
  { id: "upper-plot", name: "Upper Food Plot", zone: "Upper plot edge" },
  { id: "lower-plot", name: "Lower Food Plot", zone: "Lower plot edge" },
  { id: "upper-creek", name: "Upper Creeks Stand", zone: "Eastern creek finger" },
  { id: "marty", name: "Martys Stand", zone: "South-central" },
  { id: "papa-darin", name: "Papa Darin Stand", zone: "Southeast interior" },
  { id: "drew", name: "Drews Stand", zone: "Southeast near creek" },
  { id: "bottom-creek", name: "Bottom Creek Stand", zone: "Lower creek corridor" },
  { id: "papa-hill", name: "Papa Bobs Hill", zone: "Southern hill / point" },
];

export const briefing = {
  dateLabel: "Thursday, August 20, 2026",
  property: "Anson County, NC · Central Zone · 308 acres",
  coords: "35.076243, –80.193882",
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
  primary: ["Papa Bob Stand", "GaGa Woods Stand", "Braswell Midway"],
  secondary: ["Upper Food Plot", "Lower Food Plot", "Pine Thicket Stand"],
  caution: ["Bottom Creek Stand", "Drews Stand", "Upper Creeks Stand"],
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
