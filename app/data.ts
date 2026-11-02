// The world is drawn in a fixed coordinate space and scaled to fit the notebook.
export const WORLD_W = 1200;
export const WORLD_H = 840;
export const RULE = 40; // notebook line spacing
// Walkable notebook lines, bottom to top. Your story climbs upward.
export const FLOORS = [760, 600, 440, 280];

export type DoodleKind =
  | "chalkboard"
  | "gradcap"
  | "ghost"
  | "toolbox"
  | "apple"
  | "trophy"
  | "mailbox"
  | "phone"
  | "pin"
  | "boxbeast"
  | "map";

export type LogoKind = "lmu" | "gcc" | "tumo" | "usa" | "armenia";

export type Group = "work" | "projects" | "school" | "more";

export type Entry = {
  id: string;
  label: string; // written under the doodle in the world
  group: Group;
  doodle: DoodleKind;
  floor: number;
  x: number;
  h: number; // doodle height, for placing the prompt bubble
  title: string;
  subtitle?: string;
  dates?: string;
  points?: string[];
  tags?: string[];
  links?: { label: string; href: string }[];
  photos?: { src: string; alt: string; w?: number; h?: number; tilt?: number }[]; // taped onto the page; size defaults to 794×489
  photosBeside?: boolean; // photos sit in the empty space on the right instead of under the text
  schools?: { name: string; detail: string; place: string; dates: string; logo: LogoKind }[];
  places?: { text: string; flag: LogoKind }[]; // lines under the title, each with a little flag
  plainPage?: boolean; // page shows only its writing, no doodle in the corner
  offMap?: boolean; // has a page (reached from the tabs) but no doodle in the world
};

export const links = {
  github: "https://github.com/sona-sar",
  linkedin: "https://www.linkedin.com/in/sona-sar/",
  itch: "https://sona-sar.itch.io/",
  resume: "/SonaSargsyanResume.pdf",
};

export const entries: Entry[] = [
  // The bottom line is left empty: it is where she starts walking.
  // Second line: education, hackathons, toolbox (left to right)
  {
    id: "education",
    label: "education",
    group: "school",
    doodle: "gradcap",
    floor: 1,
    x: 340,
    h: 70,
    title: "Education",
    plainPage: true,
    schools: [
      {
        name: "Loyola Marymount University",
        detail: "B.S. Computer Science · Minor in Game Design",
        place: "Los Angeles, CA",
        dates: "Aug 2024 - May 2026",
        logo: "lmu",
      },
      {
        name: "Glendale Community College",
        detail: "A.S. Computer Science",
        place: "Glendale, CA",
        dates: "Aug 2022 - Jun 2024",
        logo: "gcc",
      },
      {
        name: "TUMO Center for Creative Technologies",
        detail: "Certificate in Studio Arts",
        place: "Yerevan, Armenia",
        dates: "Sep 2017 - Sep 2019",
        logo: "tumo",
      },
    ],
  },
  {
    id: "skills",
    label: "toolbox",
    group: "more",
    doodle: "toolbox",
    floor: 1,
    x: 940,
    h: 95,
    title: "My toolbox",
    points: [
      "Languages: Swift, Objective-C, TypeScript, JavaScript, Python, C#, C++, Java",
      "Frameworks & tools: React, Next.js, React Native, Node.js, Express, Three.js, Convex, Supabase, Clerk, Unity, Godot, Figma",
    ],
  },
  // Top line: work, all together, newest first from the left
  {
    id: "mathnasium",
    label: "Mathnasium",
    group: "work",
    doodle: "chalkboard",
    floor: 3,
    x: 1000,
    h: 100,
    title: "Mathnasium",
    subtitle: "Math Instructor",
    dates: "Sep 2022 - May 2024",
    points: [
      "Mentored students ages 5–17, breaking down tricky concepts and raising test scores.",
      "Developed approaches for students with learning disabilities.",
      "Built a supportive space where kids gained confidence in math.",
    ],
  },
  {
    id: "snap-intern",
    label: "Snap intern",
    group: "work",
    doodle: "ghost",
    floor: 3,
    x: 760,
    h: 95,
    title: "Snap Inc.",
    subtitle: "Software Engineer Intern · Ad Delivery",
    dates: "May 2025 - Aug 2025",
    points: [
      "Built a Python debugging tool that helps backend engineers diagnose issues in the Ad Delivery system.",
      "Automated visualization of decision flows and dependencies to speed up troubleshooting.",
      "Shipped a Next.js site that renders dependencies as an interactive tree, with network request and ad response simulation.",
    ],
  },
  {
    id: "lmu-ta",
    label: "TA @ LMU",
    group: "work",
    doodle: "apple",
    floor: 3,
    x: 520,
    h: 80,
    title: "Loyola Marymount University",
    subtitle: "Teaching Assistant",
    dates: "Sep 2025 - May 2026",
    points: [
      "Supported students one-on-one in Game Design and Intro to Python.",
      "Graded projects with real feedback and helped debug IDE and implementation issues.",
    ],
  },
  {
    id: "snap",
    label: "SWE @ Snap",
    group: "work",
    doodle: "phone",
    floor: 3,
    x: 280,
    h: 125,
    title: "Snap Inc.",
    subtitle: "Software Engineer · iOS, Ad Client",
    dates: "May 2026 - now",
    points: [
      "Build and ship iOS features for Snap's advertising platform with the Ad Client team.",
      "Track down and fix iOS bugs through debugging, QA and cross-functional test sessions to keep ad products stable.",
    ],
  },
  {
    id: "hackathons",
    label: "hackathons",
    group: "more",
    doodle: "trophy",
    floor: 1,
    x: 640,
    h: 100,
    title: "Hackathon wins",
    dates: "Mar 2026",
    points: [
      "1st place, LMU Hacks 2026, with Good Find.",
      "Runner-up, Google DeepMind × UCLA Glitch, with Plated.ai.",
    ],
    links: [
      { label: "Good Find", href: "https://github.com/vahan-gev/snap" },
      { label: "Plated.ai", href: "https://github.com/vahan-gev/plated-ai" },
    ],
  },
  {
    id: "contact",
    offMap: true,
    label: "say hi",
    group: "more",
    doodle: "mailbox",
    floor: 1,
    x: 800,
    h: 105,
    title: "Say hi to this person!",
    places: [
      { text: "Based in Los Angeles, California", flag: "usa" },
      { text: "Made in Yerevan, Armenia", flag: "armenia" },
    ],
    links: [
      { label: "LinkedIn", href: links.linkedin },
      { label: "GitHub", href: links.github },
      { label: "itch.io", href: links.itch },
      { label: "Resume (PDF)", href: links.resume },
    ],
    photos: [{ src: "/sona-kid.jpg", alt: "Sona as a little kid in a red hat, sitting in a garden", w: 800, h: 800, tilt: 4 }],
    photosBeside: true,
  },
  // Third line: projects
  {
    id: "goodfind",
    label: "Good Find",
    group: "projects",
    doodle: "pin",
    floor: 2,
    x: 360,
    h: 100,
    title: "Good Find",
    subtitle: "1st place · LMU Hacks 2026",
    points: [
      "A real-time, crowdsourced map of food resources across Los Angeles, built in 24 hours.",
      "Live map pins, deal scheduling, reputation badges and moderation, seeded with real LA food bank data.",
    ],
    tags: ["React Native", "TypeScript", "Convex", "Clerk"],
    links: [{ label: "GitHub", href: "https://github.com/vahan-gev/snap" }],
  },
  {
    id: "boxy",
    label: "Boxy Beasts",
    group: "projects",
    doodle: "boxbeast",
    floor: 2,
    x: 640,
    h: 85,
    title: "Boxy Beasts",
    subtitle: "A voxel Sokoban puzzle game",
    points: [
      "Grid movement, box pushing, collisions and levels that ramp up in difficulty.",
      "Hand-built voxel environments and puzzle layouts in MagicaVoxel.",
    ],
    tags: ["Unity", "C#", "MagicaVoxel"],
    links: [{ label: "Play on itch.io", href: "https://sona-sar.itch.io/boxy-beasts" }],
    photos: [
      { src: "/boxy-beasts/menu.jpg", alt: "Boxy Beasts title screen with the bunny character and stacked crates" },
      { src: "/boxy-beasts/level-meadow.jpg", alt: "A grassy level where the penguin pushes crates onto targets" },
      { src: "/boxy-beasts/level-candy.jpg", alt: "A pink level with purple blocks and the pig character" },
    ],
  },
  {
    id: "arastagh",
    label: "Arastagh.am",
    group: "projects",
    doodle: "map",
    floor: 2,
    x: 920,
    h: 110,
    title: "Arastagh.am",
    subtitle: "A category-driven discovery platform",
    points: [
      "Reusable React components for clear navigation and content discovery.",
      "Node/Express backend with Telegram integration and interactive Leaflet maps.",
    ],
    tags: ["React", "Node.js", "Express", "Leaflet", "MUI"],
  },
];

export const groupNames: Record<Group, string> = {
  work: "Work",
  projects: "Projects",
  school: "School",
  more: "More",
};
