/**
 * Silent brain of HuntBrief. Names never appear in the daily call.
 * Field-study PDFs in public/field-studies/ are the knowledge bank.
 * RULES live in bank-rules.ts. evaluateKnowledge() is the sit veto.
 */

export type KnowledgeNote = {
  id: string;
  source: string;
  rules: string[];
};

export const BANK: KnowledgeNote[] = [
  {
    id: "herndon",
    source: "Brad Herndon — terrain / thermals",
    rules: [
      "Hunt the concealed path of least resistance — just inside timber, off the skyline, never across the open field.",
      "Wind is the first filter. If scent cannot dump into dead space, the sit does not exist.",
      "Enter across the field or off the back of the ridge. Never walk the trail you intend to hunt.",
      "Hunt high when the hills allow. Swirling bottoms concentrate deer and your scent in every direction.",
      "Trust the landform even when sign looks quiet. Terrain repeats. Rubs do not.",
      "Sit the inside of the L, not the outside field corner. Daylight bucks wrap inside timber.",
      "A stand 40 yards off a field edge, inside cover, beats a stand on the field itself.",
    ],
  },
  {
    id: "higgins",
    source: "Don Higgins — sanctuary / discipline",
    rules: [
      "Make the buck live on you. A true sanctuary has no stands, cameras, plots, or mowed paths inside it.",
      "Hunt the downwind edge of the bedroom — never the mattress.",
      "The same wind must hide the walk and the sit. Easy access educates every deer between the truck and the tree.",
      "Temperature is the primary movement trigger. Hunt the drop after a warm spell, not three days later.",
      "A stand is a finite resource. If any piece is wrong, stay home.",
      "Put him at 15–20 yards with architecture, not a 40-yard hope on a field edge.",
      "Cameras map multi-year windows. Last night’s plot photo is a trap.",
    ],
  },
  {
    id: "woods",
    source: "Grant Woods — habitat / pressure",
    rules: [
      "Name the scarcest neighborhood resource, then build it better than the neighbors. On this farm that is security, not beans.",
      "Pressure is alerting, not occupancy. A hundred clean sits is zero. Three sloppy sits nocturnalize a ridge.",
      "Hang nothing until approach, hunt, and exit can be done without alerting a deer.",
      "Destination fields after dark are not the hunt. Sit the hidey-hole on the commute.",
      "Hunt wind and thermal. If either is wrong, stay out. Thread a crosswind off the trail — never cheat scent into the bed.",
      "Keep enough wind-specific trees that you never have to force a dirty sit.",
      "Creek stands are cold-morning thermal sits, not all-day sits.",
    ],
  },
  {
    id: "drury",
    source: "Mark & Terry Drury — phase / food / fronts",
    rules: [
      "A mature buck is a slave to his stomach until breeding hijacks him. Shorten the walk to food and he daylights.",
      "Hunt the phase, not the November cliché. October and December beat peak rut for a named buck.",
      "Phase 1–3: evenings, fringe, do no harm. Do not walk daylight beds. Wait for the first real cool front.",
      "A northwest tree is a northwest hunt. Do not make southwest work.",
      "Stack a front, temperature ~10° below average, 7–10 mph face-wind, and a rising barometer before you go.",
      "Kill plots are ~1 acre. Sit the 50-yard line with wind in your face. Destination grain is late-season food.",
      "Intrusion is the silent killer. If any piece is wrong, stay home.",
    ],
  },
  {
    id: "lapratt",
    source: "Tony Lapratt — maze / 90-10 / doe clock",
    rules: [
      "If he beds on you, you own his 90% daylight zone. If he beds across the road you are hunting 10%.",
      "Beds beat food. A buck can feed a destination plot from 10 p.m. to 3 a.m. and you will never kill him.",
      "A plot a buck can inventory from one corner is a five-minute farm. Maze it so he has to circle.",
      "Protect the doe clock. Three evenings of pushing does off food makes the mature buck nocturnal without ever seeing him.",
      "Wait for the bell — first hard cold front after velvet patterns break. Do not spend the farm in September.",
      "Kill and leave. Two or three sits. Do not re-pressure the machine.",
      "Named stands that only work on one wind are the overhunt risk. Rotate corners.",
    ],
  },
  {
    id: "sturgis",
    source: "Jeff Sturgis — hallways / plot jobs / pressure",
    rules: [
      "Hunting pressure is the lowest hole in the bucket. Better habitat magnifies sloppy hunting.",
      "Design access, stands, and dead space before you draw seed.",
      "Separate the cafeteria from the hallway. Destination food holds them at night. Kill plots are a daylight window.",
      "Does bed tight to screened food. Bucks slide behind that layer into quieter cover.",
      "Enter and leave on the dead side. Never walk the cafeteria.",
      "Sit the defined path — water, bench, staging — more than the plot itself.",
      "One scrape per stand. Water between dry beds and food, not inside the holding plot.",
    ],
  },
  {
    id: "waddell",
    source: "Michael Waddell — practical",
    rules: [
      "Wind and access decide. A maybe sit is a no.",
      "Don’t dress up a sour wind as a percentage. Say do not hunt.",
    ],
  },
  {
    id: "lakosky",
    source: "Lee & Tiffany Lakosky — plots / cameras",
    rules: [
      "Plots are a tool. Hunt the timber edge that feeds them.",
      "Heat = cameras. Don’t hero-sit a plot in 90 degrees.",
    ],
  },
  {
    id: "infalt",
    source: "Dan Infalt — islands of cover",
    rules: [
      "Hunt islands of cover, swamp saddles, and the hole other people won’t walk to.",
      "The hard access is the point. Easy sits are educated.",
    ],
  },
  {
    id: "eberhart",
    source: "John Eberhart — pressure",
    rules: [
      "Low-impact access. The mature buck already has you patterned if you’re sloppy.",
      "Don’t hunt the same mature-buck sit after pressure. Let it go cold.",
    ],
  },
  {
    id: "adams",
    source: "Kip Adams — biology",
    rules: [
      "Age structure first. Don’t shoot the 2.5 because you’re bored.",
    ],
  },
  {
    id: "mintz",
    source: "Cody Mintz — mobile wind",
    rules: [
      "Hang-and-hunt the wind of the day. Don’t marry a sour set.",
    ],
  },
  {
    id: "kenyon",
    source: "Mark Kenyon — e-scout",
    rules: [
      "Read lidar at the kitchen table. Walk less. Sit the pinch you already marked.",
    ],
  },
];

export type SeasonPhase = {
  id: number;
  name: string;
  window: string;
  start: string;
  end: string;
  buck: string;
  hunt: string;
  sit: "evening" | "fringe" | "observe" | "kill-plot" | "funnel" | "food" | "hold";
  doNoHarm: boolean;
};

/** Midwest skeleton, used as-is on the Anson farm. Phase 1 starts opening week. */
export const PHASES: SeasonPhase[] = [
  {
    id: 1,
    name: "New Beginning",
    window: "Sep 9 – Sep 25",
    start: "09-09",
    end: "09-25",
    buck: "Summer pattern. Bed almost on food. Little daylight walking. Heat and thermals dominate.",
    hunt: "Evenings only. Hunt does and fringe ground. Do not hunt known bedrooms at daylight. Wait for a front.",
    sit: "evening",
    doNoHarm: true,
  },
  {
    id: 2,
    name: "Greener Pastures",
    window: "Sep 25 – Oct 12",
    start: "09-25",
    end: "10-12",
    buck: "Green food still draws. Daylight ticks up if weather helps. Beans and clover are the grocery.",
    hunt: "Stay on green. Cameras decide which plots are on. Still mostly evenings.",
    sit: "evening",
    doNoHarm: true,
  },
  {
    id: 3,
    name: "October Lull",
    window: "Oct 13 – Oct 25",
    start: "10-13",
    end: "10-25",
    buck: "About 95% night movement. Scrapes appear — almost all after dark.",
    hunt: "Do less harm than good. Observe. Do not burn best trees. Skip target-buck mornings.",
    sit: "observe",
    doNoHarm: true,
  },
  {
    id: 4,
    name: "Pre-Lock",
    window: "Oct 25 – Nov 1",
    start: "10-25",
    end: "11-01",
    buck: "Favorite kill window. Necks swell, scrapes explode, range expands, first-doe hunt.",
    hunt: "Kill plots become meeting grounds. Sit the 50-yard line. Calling works. Many giants die here.",
    sit: "kill-plot",
    doNoHarm: false,
  },
  {
    id: 5,
    name: "High Excitement",
    window: "Nov 2 – Nov 5",
    start: "11-02",
    end: "11-05",
    buck: "Seeking hard. Core areas stretch. Ears back, hair up, traveling with purpose.",
    hunt: "Read body language before you call. Visibility stands. Don’t get greedy on 3-year-olds.",
    sit: "funnel",
    doNoHarm: false,
  },
  {
    id: 6,
    name: "Buck Parade",
    window: "Nov 6 – Nov 8",
    start: "11-06",
    end: "11-08",
    buck: "Young and satellite bucks everywhere. Mature ones still looking before they lock.",
    hunt: "See a long way. Pass the parade if you are hunting a 6–8 year old.",
    sit: "funnel",
    doNoHarm: false,
  },
  {
    id: 7,
    name: "Lockdown",
    window: "Nov 9 – Nov 16",
    start: "11-09",
    end: "11-16",
    buck: "Mature bucks vanish with the first hot doe. Young bucks still cruise.",
    hunt: "Don’t panic. Funnels between doe bedding. All-day sits more justified.",
    sit: "funnel",
    doNoHarm: false,
  },
  {
    id: 8,
    name: "Desperately Seeking",
    window: "Nov 17 – Nov 22",
    start: "11-17",
    end: "11-22",
    buck: "Second wave. Bucks back on their feet hunting leftovers.",
    hunt: "Cruising terrain — saddles, creek crossings, doe-bedding edges.",
    sit: "funnel",
    doNoHarm: false,
  },
  {
    id: 9,
    name: "The Party’s Over",
    window: "Nov 23 – Nov 25",
    start: "11-23",
    end: "11-25",
    buck: "Primary breeding fading. Calories start to matter again.",
    hunt: "Do not abandon plots. Transition back toward food.",
    sit: "food",
    doNoHarm: false,
  },
  {
    id: 10,
    name: "Green Revisited",
    window: "Nov 26 – Dec 5",
    start: "11-26",
    end: "12-05",
    buck: "Mature bucks return to green fields for does and calories.",
    hunt: "Big afternoon sits on remaining green. Another high-odds giant window.",
    sit: "kill-plot",
    doNoHarm: false,
  },
  {
    id: 11,
    name: "Waiting on a Front",
    window: "Dec 6 – Dec 8",
    start: "12-06",
    end: "12-08",
    buck: "Mini-lull. Need weather to flip the switch.",
    hunt: "Stay ready. A front turns this phase on overnight.",
    sit: "hold",
    doNoHarm: true,
  },
  {
    id: 12,
    name: "Feedback",
    window: "Dec 9 – Dec 21",
    start: "12-09",
    end: "12-21",
    buck: "Best late-season movement. Food is everything. Bucks can lose 20%+ of body weight.",
    hunt: "Get in early afternoon. Grain if brutal cold; green if warm.",
    sit: "food",
    doNoHarm: false,
  },
  {
    id: 13,
    name: "Grand Finale",
    window: "Dec 22 – Jan 15",
    start: "12-22",
    end: "01-15",
    buck: "Yarding into thermal cover next to last food. Daylight dies unless a savage front hits.",
    hunt: "Hunt warmest cover plus last calories. Small windows only. Do not overhunt empty plots.",
    sit: "food",
    doNoHarm: true,
  },
];

const LATE_SUMMER: SeasonPhase = {
  id: 0,
  name: "Late Summer",
  window: "Before opening week",
  start: "01-16",
  end: "09-08",
  buck: "Velvet patterns. Bed on food. Cameras, not sits.",
  hunt: "Inventory from the edge. Do not walk daylight beds. Archery opens September 12.",
  sit: "observe",
  doNoHarm: true,
};

function md(monthDay: string) {
  const [m, d] = monthDay.split("-").map(Number);
  return m * 100 + d;
}

function inWindow(stamp: number, start: string, end: string) {
  const s = md(start);
  const e = md(end);
  if (s <= e) return stamp >= s && stamp <= e;
  return stamp >= s || stamp <= e;
}

export function phaseFor(date: Date = new Date()): SeasonPhase {
  const stamp = (date.getMonth() + 1) * 100 + date.getDate();
  const hit = PHASES.find((p) => inWindow(stamp, p.start, p.end));
  return hit ?? LATE_SUMMER;
}

export type KnowledgeContext = {
  heat: boolean;
  quarters: string[];
  kind?: "bedding" | "funnel" | "food" | "staging" | "water";
  killWind: boolean;
  phase?: SeasonPhase;
  pressureRising?: boolean;
  windMph?: number | null;
  window?: "morning" | "afternoon";
};

export type ChecklistItem = {
  ok: boolean;
  text: string;
};

export type DoctrineLayer = {
  label: string;
  line: string;
};

export type KnowledgeVerdict = {
  forceNoHunt: boolean;
  line: string;
  phase: SeasonPhase;
  checklist: ChecklistItem[];
  layers: DoctrineLayer[];
};

function pick(id: string, i: number) {
  return BANK.find((b) => b.id === id)?.rules[i] ?? "";
}

function layersFor(phase: SeasonPhase, early: boolean): DoctrineLayer[] {
  return [
    {
      label: "TERRAIN",
      line: pick("herndon", 0),
    },
    {
      label: "PHASE",
      line: phase.hunt,
    },
    {
      label: "SANCTUARY",
      line: pick("higgins", 4),
    },
    {
      label: "HABITAT",
      line: early ? pick("woods", 3) : pick("sturgis", 2),
    },
  ];
}

function checklistFor(ctx: KnowledgeContext, early: boolean): ChecklistItem[] {
  const stacked = !!ctx.pressureRising && !ctx.heat && (ctx.windMph ?? 0) >= 6;
  const still = (ctx.windMph ?? 0) < 3;
  const eveningFringe = early && ctx.window === "afternoon" && !ctx.heat && !still;
  return [
    {
      ok: !ctx.heat,
      text: "Thermals agree. Heat stays in the truck.",
    },
    {
      ok: !ctx.killWind && !still,
      text: "Wind dumps into dead space — vacant field, back of the ridge, unused bank.",
    },
    {
      ok: ctx.kind !== "food" || !early,
      text: "Concealed path of least resistance — 40 yards inside timber, not destination beans.",
    },
    {
      ok: ctx.kind !== "bedding" || !early,
      text: "Walk never crosses the trail, the plot, or the bedroom.",
    },
    {
      ok: !early || stacked || eveningFringe,
      text: early
        ? "Clock: evenings and fringe only until the first stacked front."
        : "Phase and weather stacked — or this sit waits.",
    },
  ];
}

function verdict(ctx: KnowledgeContext, forceNoHunt: boolean, line: string, phase: SeasonPhase): KnowledgeVerdict {
  const early = phase.id <= 3;
  return {
    forceNoHunt,
    line,
    phase,
    checklist: checklistFor(ctx, early),
    layers: layersFor(phase, early),
  };
}

/** Daily call brain. Names never appear in the product. */
export function evaluateKnowledge(ctx: KnowledgeContext): KnowledgeVerdict {
  const phase = ctx.phase ?? phaseFor();
  const south = ctx.quarters.some((q) => ["S", "SW", "SE"].includes(q));
  const early = phase.id <= 3;
  const stacked = !!ctx.pressureRising && !ctx.heat && (ctx.windMph ?? 0) >= 6;
  const evening = ctx.window !== "morning";

  if (ctx.heat) {
    if (ctx.kind === "water") {
      return verdict(
        ctx,
        true,
        "He’ll water closer to bed than he’ll feed. Check water and the first shade — don’t sit the plot.",
        phase,
      );
    }
    return verdict(
      ctx,
      true,
      "Sweating a still September evening educates the farm before the first front. Destination food is after dark in this heat. Let the cameras work.",
      phase,
    );
  }

  if ((ctx.windMph ?? 0) < 3) {
    return verdict(
      ctx,
      true,
      "Still air. Thermals dump and swirl. Don’t sit a hole. Wait for a 7–10 mph face-wind.",
      phase,
    );
  }

  if (ctx.killWind) {
    return verdict(ctx, true, pick("waddell", 1) || "That wind is a kill. Don’t dress it up. Leave the sanctuary cold.", phase);
  }

  if (early && !evening) {
    return verdict(
      ctx,
      true,
      "Do not hunt known bedrooms at daylight. Hunt the fringe tonight. Wait for the first real cool front before a dawn sit.",
      phase,
    );
  }

  if (early && ctx.kind === "bedding") {
    return verdict(
      ctx,
      true,
      "Do not hunt known bedrooms at daylight. Hunt the fringe tonight. Wait for the first real cool front.",
      phase,
    );
  }

  if (early && ctx.kind === "food") {
    return verdict(
      ctx,
      true,
      "Beans are feedings 4 and 5 — the night cafeteria. Sit the hidey-hole on the commute, not the field.",
      phase,
    );
  }

  if (phase.id === 3 && !stacked) {
    return verdict(ctx, true, pick("drury", 2).replace("Phase 1–3: evenings, fringe, do no harm. ", "") || phase.hunt, phase);
  }

  if (ctx.kind === "funnel" && south) {
    return verdict(
      ctx,
      true,
      "Warm wind into a bottom is a thermal trap. Stay on the first terrace. Don’t walk the creek.",
      phase,
    );
  }

  if (phase.id === 11 && !stacked) {
    return verdict(ctx, true, phase.hunt, phase);
  }

  if (early && evening && (ctx.kind === "staging" || ctx.kind === "funnel")) {
    return verdict(
      ctx,
      false,
      "Fringe only. Evenings. Do not walk a bedroom. First stacked cool front is the first dawn sit on a mature-buck tree.",
      phase,
    );
  }

  if (ctx.kind === "staging") {
    return verdict(ctx, false, pick("higgins", 1) || "Hunt the intercept off the bed, not the field. Access with the wind — never through food.", phase);
  }

  if (phase.sit === "kill-plot") {
    return verdict(ctx, false, pick("drury", 5), phase);
  }

  if (ctx.kind === "bedding") {
    return verdict(ctx, false, "This is the hide. Hunt the downwind edge or leave it. One sloppy walk educates the ridge.", phase);
  }

  return verdict(ctx, false, pick("waddell", 0) || "Wind and access decide. A maybe sit is a no.", phase);
}

export function knowledgeLine(ctx: KnowledgeContext): string {
  return evaluateKnowledge(ctx).line;
}
