import type { DoodleKind, LogoKind } from "./data";

export const INK = "#2d2a32";

const CRAYONS = {
  yellow: "#ffcf33",
  red: "#ff6b6b",
  blue: "#5aa9ff",
  green: "#4fcb86",
  orange: "#ff9a3d",
  purple: "#a98bff",
  pink: "#ff8fb1",
  board: "#3d7a5a",
  brown: "#c08552",
  crimson: "#c8183f",
  navy: "#2f4fb5",
  apricot: "#f5a623",
};

type Crayon = keyof typeof CRAYONS;

/** Crayon hatch fills + the wobbly "hand drawn" filter. Render once per <svg>, with a unique id. */
export function Defs({ id, noiseRef }: { id: string; noiseRef?: React.Ref<SVGFETurbulenceElement> }) {
  return (
    <defs>
      {Object.entries(CRAYONS).map(([name, color]) => (
        <pattern
          key={name}
          id={`${id}-crayon-${name}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <rect width="7" height="7" fill={color} opacity="0.2" />
          <path d="M0 3.5H7" stroke={color} strokeWidth="3.4" opacity="0.8" />
        </pattern>
      ))}
      <filter id={`${id}-sketch`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence ref={noiseRef} type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" />
      </filter>
    </defs>
  );
}

function ghostPath(cx: number, base: number, s: number) {
  const p = (x: number, y: number) => `${cx + x * s} ${base + y * s}`;
  return `M${p(-1, 0)} L${p(-1, -1.3)} C${p(-1, -2.6)} ${p(1, -2.6)} ${p(1, -1.3)} L${p(1, 0)} L${p(0.6, -0.28)} L${p(0.2, 0)} L${p(-0.2, -0.28)} L${p(-0.6, 0)} Z`;
}

const plus = (x: number, y: number, r = 7) => `M${x} ${y - r}V${y + r}M${x - r} ${y}H${x + r}`;

function art(kind: DoodleKind, defs: string) {
  const c = (name: Crayon) => `url(#${defs}-crayon-${name})`;
  const all: Record<DoodleKind, React.ReactNode> = {
    chalkboard: (
      <>
        <path d="M-40 -38L-48 0M40 -38L48 0" />
        <path d="M-52 -100H52V-36H-52Z" fill={CRAYONS.board} />
        <text x="0" y="-60" textAnchor="middle" className="hand" fontSize="26" fill="#fff" stroke="none">
          1+2=3
        </text>
        <path d="M-30 -48Q0 -42 30 -48" stroke="#fff" strokeWidth="2" />
      </>
    ),
    gradcap: (
      <>
        <path d="M-28 -36V-12Q0 0 28 -12V-36" fill={c("blue")} />
        <path d="M-52 -48L0 -68L52 -48L0 -30Z" fill={c("blue")} />
        <path d="M0 -49L40 -44L42 -18" />
        <circle cx="42" cy="-14" r="4" fill={CRAYONS.yellow} />
      </>
    ),
    ghost: (
      <>
        <path d={ghostPath(-12, 0, 30)} fill={c("yellow")} />
        <circle cx="-22" cy="-50" r="3" fill={INK} />
        <circle cx="-6" cy="-50" r="3" fill={INK} />
        <path d="M-20 -38Q-14 -33 -8 -38" />
        <circle cx="34" cy="-58" r="16" fill="#fff" />
        <path d="M45 -46L60 -28" strokeWidth="5" />
        <ellipse cx="34" cy="-58" rx="5" ry="4" fill={INK} />
        <path d="M30 -63L27 -67M38 -63L41 -67M29 -56L25 -55M39 -56L43 -55" strokeWidth="2" />
      </>
    ),
    toolbox: (
      <>
        <path d="M-30 -48L-40 -92" strokeWidth="6" stroke={CRAYONS.orange} />
        <path d="M-30 -48L-40 -92" />
        <path d="M-40 -92L-42 -100" />
        <path d="M12 -48L22 -84L30 -82L20 -48" fill={c("purple")} />
        <path d="M-46 0V-48H46V0Z" fill={c("red")} />
        <path d="M-46 -30H46" />
        <path d="M-6 -36H6V-24H-6Z" fill="#fff" />
      </>
    ),
    apple: (
      <>
        <path d="M-46 0V-18H46V0Z" fill={c("blue")} />
        <path d="M-40 -18V-34H38V-18Z" fill={c("green")} />
        <path
          d="M0 -60C-8 -66 -26 -64 -26 -48C-26 -34 -14 -30 -6 -34C-2 -32 2 -32 6 -34C14 -30 26 -34 26 -48C26 -64 8 -66 0 -60Z"
          fill={c("red")}
        />
        <path d="M0 -60Q2 -70 6 -74" />
        <path d="M4 -68Q14 -76 18 -68Q10 -64 4 -68Z" fill={c("green")} />
      </>
    ),
    trophy: (
      <>
        <path d="M-34 0V-12H34V0Z" fill={c("brown")} />
        <path d="M-22 -12V-24H22V-12Z" fill={c("yellow")} />
        <path d="M0 -24V-46" strokeWidth="5" />
        <path d="M-30 -100H30C30 -62 16 -48 0 -48C-16 -48 -30 -62 -30 -100Z" fill={c("yellow")} />
        <path d="M-30 -90C-50 -90 -48 -62 -22 -64M30 -90C50 -90 48 -62 22 -64" />
        <path d="M0 -88L4 -79L13 -78L6 -72L8 -63L0 -68L-8 -63L-6 -72L-13 -78L-4 -79Z" fill={CRAYONS.orange} strokeWidth="2" />
      </>
    ),
    mailbox: (
      <>
        <path d="M0 0V-50" strokeWidth="6" />
        <path d="M-36 -50V-84C-36 -106 36 -106 36 -84V-50Z" fill={c("blue")} />
        <path d="M-36 -84C-36 -98 -12 -98 -12 -84V-50" />
        <path d="M36 -70H48V-98H62V-88H48" fill={c("red")} />
        <path d="M-28 -70H-4V-56H-28Z" fill="#fff" />
        <path d="M-28 -70L-16 -62L-4 -70" strokeWidth="2" />
      </>
    ),
    phone: (
      <>
        <rect x="-32" y="-124" width="64" height="120" rx="12" fill="#fff" />
        <rect x="-25" y="-112" width="50" height="90" rx="4" fill={c("yellow")} />
        <path d={ghostPath(0, -46, 16)} fill="#fff" />
        <circle cx="-5" cy="-72" r="2" fill={INK} />
        <circle cx="5" cy="-72" r="2" fill={INK} />
        <circle cx="0" cy="-12" r="3.5" />
        <path d={plus(-48, -96)} />
        <path d={plus(48, -112, 5)} />
        <path d={plus(52, -70, 8)} stroke={CRAYONS.orange} />
      </>
    ),
    pin: (
      <>
        <ellipse cx="0" cy="0" rx="22" ry="4" fill={INK} opacity="0.15" stroke="none" />
        <path
          d="M0 0C-4 -12 -30 -36 -30 -62C-30 -80 -16 -92 0 -92C16 -92 30 -80 30 -62C30 -36 4 -12 0 0Z"
          fill={c("red")}
        />
        <circle cx="0" cy="-62" r="15" fill="#fff" />
        <path
          d="M0 -64C-3 -67 -11 -66 -11 -59C-11 -52 -5 -50 -2 -52C-1 -51 1 -51 2 -52C5 -50 11 -52 11 -59C11 -66 3 -67 0 -64Z"
          fill={CRAYONS.red}
          strokeWidth="2"
        />
        <path d="M0 -64Q1 -69 3 -71" strokeWidth="2" />
        <path d="M2 -68Q8 -72 10 -67Q6 -65 2 -68Z" fill={CRAYONS.green} strokeWidth="1.5" />
        <path d={plus(40, -84, 6)} stroke={CRAYONS.orange} />
        <path d={plus(-40, -70, 5)} />
      </>
    ),
    boxbeast: (
      <>
        <path d="M-34 -66L-20 -80H48L34 -66Z" fill={c("yellow")} />
        <path d="M34 0L48 -14V-80L34 -66Z" fill={c("brown")} />
        <path d="M-34 0V-66H34V0Z" fill={c("orange")} />
        <path d="M-24 -66L-30 -84M20 -66L26 -84" />
        <circle cx="-12" cy="-42" r="8" fill="#fff" />
        <circle cx="12" cy="-42" r="8" fill="#fff" />
        <circle cx="-10" cy="-41" r="3" fill={INK} />
        <circle cx="14" cy="-41" r="3" fill={INK} />
        <path d="M-14 -20L-9 -14L-4 -20L1 -14L6 -20L11 -14L16 -20" strokeWidth="2.5" />
      </>
    ),
    map: (
      <>
        <path d="M-46 -6L-16 4L16 -6L46 4V-72L16 -82L-16 -72L-46 -82Z" fill={c("green")} />
        <path d="M-16 4V-72M16 -6V-82" strokeWidth="2" />
        <path d="M-34 -24C-20 -60 4 -20 26 -56" strokeDasharray="5 7" strokeWidth="2.5" />
        <path d="M22 -64L32 -54M32 -64L22 -54" stroke={CRAYONS.red} strokeWidth="4" />
        <path d="M8 -112L44 -124L32 -92L24 -104Z" fill="#fff" />
        <path d="M24 -104L44 -124" strokeWidth="2" />
      </>
    ),
  };
  return all[kind];
}

export function Doodle({ kind, defs }: { kind: DoodleKind; defs: string }) {
  return (
    <g
      className="art"
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {art(kind, defs)}
    </g>
  );
}

/** A sun of spikes, long and short in turn, for the LMU lion's mane. */
function sun(cx: number, cy: number, tips: number, inner: number, long: number, short: number) {
  const pts: string[] = [];
  for (let i = 0; i < tips * 2; i++) {
    const a = (i * Math.PI) / tips - Math.PI / 2;
    const r = i % 2 ? inner : (i / 2) % 2 ? short : long;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}
const MANE = sun(48, 50, 16, 23, 45, 34);

// Drawing area [x, y, w, h], and the height it shows at next to the name, in px
const LOGO_BOX: Record<LogoKind, [number, number, number, number]> = {
  lmu: [0, 0, 96, 100],
  gcc: [0, 0, 200, 100],
  tumo: [0, 0, 182, 84],
  usa: [0, 0, 120, 80],
  armenia: [0, 0, 120, 80],
};
const LOGO_HEIGHT: Record<LogoKind, number> = { lmu: 72, gcc: 66, tumo: 57, usa: 21, armenia: 21 };

/** School logos and flags, redrawn in crayon. Small enough to sit next to a line of text. */
export function Logo({ kind, defs }: { kind: LogoKind; defs: string }) {
  const c = (name: Crayon) => `url(#${defs}-crayon-${name})`;
  const art: Record<LogoKind, React.ReactNode> = {
    // The lion in the sun
    lmu: (
      <>
        <path d={MANE} fill={c("crimson")} />
        <path d="M36 37L48 33L60 37Q66 44 64 52L57 62L56 69L48 72L40 69L39 62L32 52Q30 44 36 37Z" fill="#fff" />
        <path d="M39 46L45 48L44 52Q40 51 39 46Z M57 46L51 48L52 52Q56 51 57 46Z M44 57H52L48 61Z" fill={INK} strokeWidth="1.5" />
        <path d="M42 66L48 64L54 66" strokeWidth="2" />
      </>
    ),
    // The red bridge arch with a gold streak, three little arches under it, and the name
    gcc: (
      <>
        <path d="M6 50Q50 10 124 10" stroke={CRAYONS.yellow} strokeWidth="6" />
        <path d="M12 56Q95 -4 194 24Q100 26 32 56Z" fill={c("crimson")} />
        <path d="M54 56Q71 30 88 56M92 56Q109 28 126 56M130 56Q147 30 164 56" stroke={CRAYONS.crimson} strokeWidth="6" />
        <text x="100" y="83" fontSize="30" letterSpacing="3" textAnchor="middle" fill={INK} stroke="none">
          GLENDALE
        </text>
        <text x="100" y="98" fontSize="12" letterSpacing="2" textAnchor="middle" fill={INK} stroke="none">
          COMMUNITY COLLEGE
        </text>
      </>
    ),
    // Fat marker letters that overlap and mix where they cross
    tumo: (
      <g strokeWidth="13" style={{ mixBlendMode: "multiply" }}>
        <path d="M10 22H44M27 22V62" stroke={CRAYONS.yellow} />
        <path d="M48 22V46Q48 62 62 62Q76 62 76 46V22" stroke={CRAYONS.orange} />
        <path d="M80 62V38Q80 22 94 22Q106 22 106 38V62M106 38Q106 22 118 22Q130 22 130 38V62" stroke={CRAYONS.blue} />
        <circle cx="152" cy="42" r="20" stroke={CRAYONS.green} />
      </g>
    ),
    // Wavy crayon stripes, a scribbled blue corner and a few white dots for stars
    usa: (
      <>
        <path d="M6 10.0Q33 7.0 60 10.0T114 10.0M6 20.3Q33 17.3 60 20.3T114 20.3M6 30.6Q33 27.6 60 30.6T114 30.6M6 40.9Q33 37.9 60 40.9T114 40.9M6 51.2Q33 48.2 60 51.2T114 51.2M6 61.5Q33 58.5 60 61.5T114 61.5M6 71.8Q33 68.8 60 71.8T114 71.8" stroke={CRAYONS.crimson} strokeWidth="5.5" />
        <path d="M5 5Q30 2 56 6L54 44Q30 47 7 43Z" fill={CRAYONS.navy} opacity="0.55" stroke="none" />
        <path d="M5 5Q30 2 56 6L54 44Q30 47 7 43Z" fill={c("navy")} stroke="none" />
        <path d="M15 14h0M28 13h0M42 14h0M21 24h0M35 24h0M15 34h0M28 33h0M42 34h0" stroke="#fff" strokeWidth="5" />
      </>
    ),
    // Three wavy marker bands, each drawn as two strokes: red, blue, apricot
    armenia: (
      <>
        <path d="M8 12.0Q35 9.0 60 12.0T112 12.0M8 22.0Q35 19.0 60 22.0T112 22.0" stroke={CRAYONS.crimson} strokeWidth="11" />
        <path d="M8 35.0Q35 32.0 60 35.0T112 35.0M8 45.0Q35 42.0 60 45.0T112 45.0" stroke={CRAYONS.navy} strokeWidth="11" />
        <path d="M8 58.0Q35 55.0 60 58.0T112 58.0M8 68.0Q35 65.0 60 68.0T112 68.0" stroke={CRAYONS.apricot} strokeWidth="11" />
      </>
    ),
  };
  return (
    <svg
      viewBox={LOGO_BOX[kind].join(" ")}
      height={LOGO_HEIGHT[kind]}
      width={(LOGO_HEIGHT[kind] * LOGO_BOX[kind][2]) / LOGO_BOX[kind][3]}
      style={{
        display: "inline-block",
        marginLeft: "0.45em",
        verticalAlign: "middle",
        // Taller than the text, so pull it in top and bottom to keep the line one rule high
        marginBlock: -(LOGO_HEIGHT[kind] - 24) / 2,
        overflow: "visible",
      }}
      aria-hidden
    >
      <g
        filter={`url(#${defs}-sketch)`}
        fill="none"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Spans the whole drawing area so the wobble filter never crops thick strokes */}
        <rect x={LOGO_BOX[kind][0]} y={LOGO_BOX[kind][1]} width={LOGO_BOX[kind][2]} height={LOGO_BOX[kind][3]} stroke="none" />
        {art[kind]}
      </g>
    </svg>
  );
}

export type ArrowDir = "left" | "right" | "up" | "down" | "up-right";
const ARROW_TURN: Record<ArrowDir, number> = { right: 0, down: 90, left: 180, up: -90, "up-right": -45 };

/** A pencil-drawn arrow on a 20×20 grid: a slightly bowed shaft and an uneven head. */
export function ArrowStrokes({ dir, color = "currentColor" }: { dir: ArrowDir; color?: string }) {
  return (
    <g
      transform={`rotate(${ARROW_TURN[dir]} 10 10)`}
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 10.8Q9 9.1 16.8 10.1" />
      <path d="M11.6 5.6Q14.6 8 17.3 10.1Q14.4 12.3 12.3 14.8" />
    </g>
  );
}

/** Hand-drawn arrow for use inside HTML text; sized and colored like the text around it. */
export function Arrow({ dir, size = "0.95em" }: { dir: ArrowDir; size?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "-0.1em" }}
    >
      <ArrowStrokes dir={dir} />
    </svg>
  );
}
