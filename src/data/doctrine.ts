export type FieldStudy = {
  id: string;
  name: string;
  role: string;
  chair: string;
  sentence: string;
  steps: string[];
  anson: string[];
  pdf: string;
};

export const FIELD_STUDIES: FieldStudy[] = [
  {
    id: "herndon",
    name: "Brad Herndon",
    role: "Terrain engine — locked",
    chair: "Where the feet go",
    sentence:
      "Deer use choke points in daylight to stay hidden and take the easiest path that still keeps cover. Maps first. Wind first. Trust the landform even when the dirt looks quiet.",
    steps: [
      "Read the map before you walk — mark every choke point on paper.",
      "Draw the easiest concealed daylight path through each feature.",
      "Assign a legal wind. If scent cannot dump into dead space, kill the sit.",
      "Enter across the field or off the back of the ridge — never across the trail.",
      "Hunt high when the hills allow. Avoid swirling bottoms.",
      "Trust the feature even when sign looks quiet. Terrain repeats; rubs do not.",
    ],
    anson: [],
    pdf: "/field-studies/brad-herndon.pdf",
  },
  {
    id: "woods",
    name: "Grant Woods",
    role: "Habitat and pressure",
    chair: "How to feed, hide, and approach those feet",
    sentence:
      "Four daily needs: food, cover, water, security. Pressure is alerting, not occupancy. Build the grocery and the quiet room, then hunt the hallway without writing your name on the air.",
    steps: [
      "Name the scarcest neighborhood resource — then build it better than the neighbors.",
      "Pair food, cover, water, and a true sanctuary so deer feel safe on your acres.",
      "Design bottlenecks (natural and built) so daylight travel is predictable.",
      "Hang nothing until approach, hunt, and exit can be done without alerting a deer.",
      "Hunt the wind and the thermal. If either is wrong, stay out.",
      "Keep enough wind-specific stands that you never have to cheat a sit.",
    ],
    anson: [],
    pdf: "/field-studies/grant-woods.pdf",
  },
  {
    id: "higgins",
    name: "Don Higgins",
    role: "Sanctuary and go / no-go",
    chair: "When to cash the sit — and when to leave the tree unhunted",
    sentence:
      "A mature buck’s number-one desire is never to encounter a human. Get him to bed on you. Hunt the fringe of that safe ground only when temperature, front, wind, and history agree.",
    steps: [
      "Make the buck live on you — a true zero-intrusion sanctuary.",
      "Build one clean walk to a wind-specific tree on the sanctuary edge.",
      "Do not hunt that tree until temperature, front, wind, and history agree.",
      "Know the buck as an individual: annual calendar, personality, range.",
      "Put him at 15–20 yards with habitat architecture, not hope.",
      "If any piece is wrong — don’t go. The stand is a finite resource.",
    ],
    anson: [],
    pdf: "/field-studies/don-higgins.pdf",
  },
  {
    id: "drury",
    name: "Drury Brothers",
    role: "Phase, food, and stacked weather",
    chair: "Whether today is a day that choke is worth the walk",
    sentence:
      "A mature buck is a slave to his stomach until breeding hijacks him. Shorten the walk. Hunt the phase, not the November cliché. Stack a front before you go. Do no harm in the first three phases.",
    steps: [
      "Shorten the walk — a mature buck that can fill up next to his bed will do it in daylight.",
      "Design access first. If you blow the bedroom walking in, the stand does not exist.",
      "Hunt wind-specific trees. A northwest tree is hunted only on a northwest wind.",
      "Hunt the phase, not the cliché. October and December beat peak November for a named buck.",
      "Stack a front, falling temperature, rising barometer, and a 7–10 mph face-wind before you go.",
      "Do no harm. If any piece is wrong — stay home. Intrusion is the silent killer of old bucks.",
    ],
    anson: [],
    pdf: "/field-studies/drury-brothers.pdf",
  },
  {
    id: "lapratt",
    name: "Tony Lapratt",
    role: "Maze, beds, daylight theft",
    chair: "How to make him spend 45 minutes here instead of 5",
    sentence:
      "A buck spends 70% of his life on his belly. If he beds on you, you own his 90% daylight zone. Maze the food so he cannot inventory it from one corner. Wait for the bell. Kill and leave.",
    steps: [
      "Own the bedroom — daylight buck beds and separate doe / fawn rooms.",
      "Zone the woods — visual walls so more than one animal can live there.",
      "Maze the food — stop one-corner inventory; force a circle.",
      "Build the deer roads — sneak trails, scrape lines, staging, water.",
      "Build the hunter roads — entrance and exit that protect the doe clock.",
      "Wait for the bell — first hard cold front after velvet patterns break.",
      "Hunt the 90% zone — bed to staging to maze corner, all day if needed.",
      "Kill and leave — two or three sits. Do not re-pressure the farm.",
    ],
    anson: [],
    pdf: "/field-studies/tony-lapratt.pdf",
  },
  {
    id: "sturgis",
    name: "Jeff Sturgis",
    role: "Hallways, plot jobs, pressure",
    chair: "Whether food and walking routes feed the other two systems — or fight them",
    sentence:
      "Hunting pressure is the lowest hole in the bucket. Design the hunt first. Separate the cafeteria from the hallway. Sit the defined path more than the plot. Better habitat magnifies sloppy hunting.",
    steps: [
      "Design the hunt first. Access, stands, and pressure beat seed.",
      "Separate destination food from the hallway you will actually sit.",
      "Screen the edge so does bed tight to screened food and bucks slide behind them.",
      "Pin the hallway with one scrape per stand and water between dry beds and food.",
      "Enter and leave on the dead side. Never walk the cafeteria.",
      "Sit the defined path — water, bench, staging — more than the plot itself.",
    ],
    anson: [],
    pdf: "/field-studies/jeff-sturgis.pdf",
  },
];

export const DOCTRINE_STACK = [
  { q: "Where will a buck walk in daylight on this map?", a: "Herndon — choke points, points, inside corners, creek funnels." },
  { q: "How do I make him spend 45 minutes here instead of 5?", a: "Lapratt — maze, zones, sneak trails, staging." },
  { q: "How do I keep from ruining that work this week?", a: "Higgins — sanctuary, dirty-access veto, temperature, stay home." },
  { q: "Is today even a day?", a: "Drury — phase, front, face-wind, rising barometer, palatable food." },
  { q: "Are the beans and plots fighting the hunt?", a: "Sturgis — cafeteria vs hallway, screens, dead-side access." },
  { q: "What is scarce, and did I alert them?", a: "Woods — security over more food; pressure is detection, not occupancy." },
];
