/**
 * Extracted knowledge bank from the six HuntBrief field-study PDFs.
 * Daily call never name-drops. FIELD searches this. PDFs live at /field-studies/.
 */

export type BankTopic =
  | "terrain"
  | "wind"
  | "access"
  | "sanctuary"
  | "food"
  | "phase"
  | "pressure"
  | "beds"
  | "discipline"
  | "anson";

export const TOPICS: { id: BankTopic | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "terrain", label: "Terrain" },
  { id: "wind", label: "Wind" },
  { id: "access", label: "Access" },
  { id: "sanctuary", label: "Sanctuary" },
  { id: "food", label: "Food" },
  { id: "phase", label: "Phase" },
  { id: "pressure", label: "Pressure" },
  { id: "beds", label: "Beds" },
  { id: "discipline", label: "Discipline" },
];

export type BankRule = {
  id: string;
  source: string;
  topic: BankTopic;
  rule: string;
};

export const SOURCE_NAMES: Record<string, string> = {
  herndon: "Brad Herndon",
  higgins: "Don Higgins",
  woods: "Grant Woods",
  drury: "Drury Brothers",
  lapratt: "Tony Lapratt",
  sturgis: "Jeff Sturgis",
};

export const RULES: BankRule[] = [
  // —— Herndon ——
  {
    id: "h-1",
    source: "herndon",
    topic: "terrain",
    rule: "Daylight bucks use choke points to stay hidden and take the easiest path that still keeps cover. Maps first. Boots confirm. They do not invent the plan.",
  },
  {
    id: "h-2",
    source: "herndon",
    topic: "terrain",
    rule: "Hunt the path, not the route. A stand 40 yards off a field edge, inside timber, beats a stand on the field itself. Night trails across beans are not the hunt.",
  },
  {
    id: "h-3",
    source: "herndon",
    topic: "terrain",
    rule: "Sit the inside of the L, not the outside field corner. Daylight bucks wrap just inside timber. Soybean years make the wrap louder — beans expose a crossing corn would hide.",
  },
  {
    id: "h-4",
    source: "herndon",
    topic: "wind",
    rule: "Wind is the first filter. If scent cannot dump into dead space — vacant field, back of the ridge, unused bank — the sit does not exist that day.",
  },
  {
    id: "h-5",
    source: "herndon",
    topic: "wind",
    rule: "Hunt high when the hills allow. Swirling bottoms concentrate deer and your scent in every direction. Creek funnels only on a steady wind that dumps downstream.",
  },
  {
    id: "h-6",
    source: "herndon",
    topic: "access",
    rule: "Enter across the field that forms the corner, or off the back of the ridge. Never walk the trail you intend to hunt. A dirty walk is a dirty sit.",
  },
  {
    id: "h-7",
    source: "herndon",
    topic: "discipline",
    rule: "Trust the landform even when sign looks quiet. Terrain repeats. Rubs do not. A primary stand must name the choke, the path, the dump, and the walk — or it is secondary.",
  },

  // —— Higgins ——
  {
    id: "g-1",
    source: "higgins",
    topic: "sanctuary",
    rule: "A mature buck’s number-one desire is never to encounter a human. Get him to bed on you. A true sanctuary has no stands, cameras, plots, or mowed paths inside it.",
  },
  {
    id: "g-2",
    source: "higgins",
    topic: "access",
    rule: "See no evil, hear no evil, smell no evil. The same wind must hide the walk and the sit. Easy access educates every deer between the truck and the tree. Good access can be miserable.",
  },
  {
    id: "g-3",
    source: "higgins",
    topic: "wind",
    rule: "Play the wind the way the buck plays it. A quartering nose wind lets him feel safe while scent streams off the trail. Layout beats a scent-control suit.",
  },
  {
    id: "g-4",
    source: "higgins",
    topic: "phase",
    rule: "Temperature is the primary movement trigger — not the rut, not the moon. Hunt the drop after a warm spell, not three days later. Heat in October or the peak rut is a stay-home day.",
  },
  {
    id: "g-5",
    source: "higgins",
    topic: "discipline",
    rule: "A stand is a finite resource. If any piece is wrong — wind, walk, heat, history — don’t go. He hunts fewer hours now than in 49 years of bowhunting on purpose.",
  },
  {
    id: "g-6",
    source: "higgins",
    topic: "pressure",
    rule: "Cameras map multi-year windows. Last night’s plot photo is a trap. Same time, same place, year after year — not yesterday at 4:12.",
  },

  // —— Woods ——
  {
    id: "w-1",
    source: "woods",
    topic: "food",
    rule: "Name the scarcest neighborhood resource, then build it better than the neighbors. On this farm that is security, not beans. You cannot out-feed commercial soybeans. Hunt the commute.",
  },
  {
    id: "w-2",
    source: "woods",
    topic: "pressure",
    rule: "Pressure is alerting, not occupancy. A hundred clean sits is zero. Three sloppy sits nocturnalize a ridge. Abandon a tree because you burned it — not because you sat it.",
  },
  {
    id: "w-3",
    source: "woods",
    topic: "access",
    rule: "One rule for stands: approach, hunt, and exit without alerting a deer. A great tree with a dirty walk is a bad stand.",
  },
  {
    id: "w-4",
    source: "woods",
    topic: "wind",
    rule: "Hunt wind and thermal. If either is wrong, stay out. Thread a crosswind off the trail — never cheat scent into the bed. Thermals beat the forecast arrow.",
  },
  {
    id: "w-5",
    source: "woods",
    topic: "food",
    rule: "Destination fields after dark are not the hunt. Sit the hidey-hole on the commute. Keep enough wind-specific trees that you never have to force a dirty sit.",
  },
  {
    id: "w-6",
    source: "woods",
    topic: "sanctuary",
    rule: "Cover is structure. Security is structure that is not threatened. Thick you walk every weekend is cover. The same thicket nobody enters from September through January is security.",
  },

  // —— Drury ——
  {
    id: "d-1",
    source: "drury",
    topic: "food",
    rule: "A mature buck is a slave to his stomach until breeding hijacks him. Shorten the walk to 50–150 yards from bed and he daylights. A 400-yard open crossing waits for dark.",
  },
  {
    id: "d-2",
    source: "drury",
    topic: "phase",
    rule: "Hunt the phase, not the November cliché. October 5–12 and 25–31, plus Green Revisited / Feedback, beat peak November for a named buck. Do no harm in phases 1–3.",
  },
  {
    id: "d-3",
    source: "drury",
    topic: "phase",
    rule: "Stack a front before you go: temperature ~10° below average, 7–10 mph face-wind, rising barometer (30.15–30.5), a spit of rain. One factor is never enough.",
  },
  {
    id: "d-4",
    source: "drury",
    topic: "wind",
    rule: "A northwest tree is a northwest hunt. Do not make southwest work. Morning: sit high. Evening: sit lower only if wind beats the thermal dump. Weak evening wind in a hole is a refuse.",
  },
  {
    id: "d-5",
    source: "drury",
    topic: "wind",
    rule: "Rut wind math: fool 75% of noses, accept 25%. Doe panic is worse than a busted buck — especially December. Early season does not get that math. Sweating a still September evening educates the farm.",
  },
  {
    id: "d-6",
    source: "drury",
    topic: "food",
    rule: "Kill plots are ~1 acre. Sit the 50-yard line with wind in your face. Destination grain is late-season food. Clover wins most days.",
  },
  {
    id: "d-7",
    source: "drury",
    topic: "discipline",
    rule: "Intrusion is the silent killer. If cameras show no daylight, do not invent a dawn sit on his bedroom. If any piece is wrong, stay home.",
  },

  // —— Lapratt ——
  {
    id: "l-1",
    source: "lapratt",
    topic: "beds",
    rule: "A buck spends 70% of his life on his belly. If he beds on you, you own his 90% daylight zone. If he beds across the road you are hunting 10%. Beds beat food.",
  },
  {
    id: "l-2",
    source: "lapratt",
    topic: "food",
    rule: "A plot a buck can inventory from one corner is a five-minute farm. Maze it so he has to circle. Time-on-property jumps from five minutes to 40–50. That is the scoreboard.",
  },
  {
    id: "l-3",
    source: "lapratt",
    topic: "pressure",
    rule: "Protect the doe clock. Three evenings of pushing does off food makes the mature buck nocturnal without ever seeing him. Entrance, exit, and rotation exist for the does.",
  },
  {
    id: "l-4",
    source: "lapratt",
    topic: "phase",
    rule: "Wait for the bell — first hard cold front after velvet patterns break. Do not spend the farm in September. Translate October 25 to local weather, not a copied date.",
  },
  {
    id: "l-5",
    source: "lapratt",
    topic: "discipline",
    rule: "Kill and leave. Two or three sits. Do not re-pressure the machine. Named stands that only work on one wind are the overhunt risk. Rotate corners.",
  },

  // —— Sturgis ——
  {
    id: "s-1",
    source: "sturgis",
    topic: "pressure",
    rule: "Hunting pressure is the lowest hole in the bucket. Better habitat magnifies sloppy hunting. If you hunt sloppy, you are often better doing nothing to the land.",
  },
  {
    id: "s-2",
    source: "sturgis",
    topic: "access",
    rule: "Design access, stands, and dead space before you draw seed. Access decides where food is allowed. Never walk the cafeteria.",
  },
  {
    id: "s-3",
    source: "sturgis",
    topic: "food",
    rule: "Separate the cafeteria from the hallway. Destination food holds them at night. Kill plots are a daylight window — short stop, then they keep going. Mixing jobs is how farms go nocturnal.",
  },
  {
    id: "s-4",
    source: "sturgis",
    topic: "food",
    rule: "Five feedings in 24 hours. 1–2 = browse near bed. 3 = dinner, about an hour before dark — highest-value clock. 4–5 = night on big ag. Fence-row beds beside beans are midnight beds, not evening stands.",
  },
  {
    id: "s-5",
    source: "sturgis",
    topic: "beds",
    rule: "Does bed tight to screened food. Bucks slide behind that layer into quieter cover. Sit the defined path — water, bench, staging — more than the plot itself.",
  },
];

export type TerrainFeature = {
  id: string;
  name: string;
  map: string;
  sit: string;
  kill: string;
};

export const TERRAIN_LIBRARY: TerrainFeature[] = [
  {
    id: "inside-corner",
    name: "Inside corner",
    map: "Timber shaped like an L. One inside corner, five outside.",
    sit: "Inside cover at the tip. Enter across the field. Dump scent into vacant open ground.",
    kill: "Wind from the stand into the timber they are using. Hanging on the outside point.",
  },
  {
    id: "saddle",
    name: "Saddle",
    map: "Dip in a ridgeline. Contours pinch, open, pinch. Hottest spot in the hills.",
    sit: "Conservative downwind fringe. Come up the back of the ridge. Stay off the skyline.",
    kill: "A wind that runs the saddle like a tube and carries you to both approaches.",
  },
  {
    id: "bench",
    name: "Bench",
    map: "Flat shelf on a face. Tight / spread / tight contours.",
    sit: "Shoulder of the shelf. Learn thermals. Do not walk the bench to the tree.",
    kill: "A hard wind that pins scent to the bench trail.",
  },
  {
    id: "point",
    name: "Point",
    map: "Ridge finger dropping into a bottom, field, or creek. Contour U or V pointing downhill.",
    sit: "Downwind shoulder, not the skyline spine. Cross often at the tip.",
    kill: "Sitting the spine so every trail feeding the point gets your scent.",
  },
  {
    id: "hilltop-funnel",
    name: "Hilltop field funnel",
    map: "Drain from a hilltop field down to a valley. Neck is field-edge to first drop.",
    sit: "Access through the field. Dump scent into the opening.",
    kill: "Wind that blows down the drainage into bedding.",
  },
  {
    id: "funnel",
    name: "Perfect funnel",
    map: "Narrow cover connecting two larger blocks.",
    sit: "Downwind fringe, not mid-trail. Do not walk the pinch.",
    kill: "Using the funnel as your walk. Swirling day on a pretty map.",
  },
  {
    id: "breakline",
    name: "Breakline",
    map: "Seam where two cover types meet — pine to oak, crop to CRP.",
    sit: "Offset downwind. See both sides. Do not stand in the seam.",
    kill: "Walking the seam. Standing in the trail.",
  },
  {
    id: "creek",
    name: "Creek / water pinch",
    map: "Stream edge, swamp bulge, dam crest, unused bank.",
    sit: "Either end of a dam crest or the thin timber sliver. Unused bank.",
    kill: "Calm mornings and swirling October bottoms.",
  },
  {
    id: "hub",
    name: "Converging hub",
    map: "Several ridges or drains meet like spokes.",
    sit: "Bow picks one spoke, downwind edge — not the hub itself.",
    kill: "Sitting the hub and hoping every spoke is yours.",
  },
  {
    id: "fencerow",
    name: "Fencerow",
    map: "Covered strip connecting timber blocks, especially hilltop fences.",
    sit: "Do not walk the fence. Blind if trees are wrong.",
    kill: "Using the fencerow as the walk.",
  },
];

export function searchBank(
  query: string,
  topic: BankTopic | "all" = "all",
  source?: string,
): BankRule[] {
  const needle = query.trim().toLowerCase();
  return RULES.filter((r) => {
    if (topic !== "all" && r.topic !== topic) return false;
    if (source && r.source !== source) return false;
    if (!needle) return true;
    const name = SOURCE_NAMES[r.source] ?? r.source;
    return (
      r.rule.toLowerCase().includes(needle) ||
      r.topic.includes(needle) ||
      r.source.includes(needle) ||
      name.toLowerCase().includes(needle)
    );
  });
}
