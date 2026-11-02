"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { entries as allEntries, FLOORS, RULE, WORLD_H, WORLD_W } from "./data";

// Only the doodles drawn in the world; some pages are reached from the tabs instead.
const entries = allEntries.filter((e) => !e.offMap);
const START_X = 1100; // she starts in the bottom-right corner, looking left
import {
  Arrow,
  ArrowStrokes,
  Defs,
  Doodle,
  INK,
  type ArrowDir,
} from "./doodles";

const HAIR = "#4a3328";

type Input = {
  left: boolean;
  right: boolean;
  jump: boolean;
  down: boolean;
  interact: boolean;
};

const GRAVITY = 4200;
const FALL_GRAVITY = 5800; // heavier on the way down for a snappy arc
const JUMP_V = 1250; // clears one floor (160 units) with a little room to spare
const CHAR_H = 120; // feet to top of hair
const HEADROOM = 8; // gap kept between her hair and the top of the page
const SPEED = 280;
const REACH = 62;
const X_MIN = 115;
const X_MAX = 1170;
const MIN_VIEW_W = 560;
const DOODLE_SCALE = 0.8; // drawings in the world are drawn at 80% of their page size // on narrow screens the camera pans instead of shrinking further

// ---- Rig ---------------------------------------------------------------
// Angles in degrees; 0 = limb hanging straight down, negative = toward facing direction.
const JOINTS = [
  "thighF",
  "kneeF",
  "thighB",
  "kneeB",
  "armF",
  "elbowF",
  "armB",
  "elbowB",
] as const;
type Joint = (typeof JOINTS)[number];
type Pose = Record<Joint, number>;

function idle(t: number): Pose {
  const sway = Math.sin(t * 2) * 3;
  return {
    thighF: -4,
    kneeF: 3,
    thighB: 5,
    kneeB: 2,
    armF: -12 + sway,
    elbowF: -8,
    armB: 12 - sway,
    elbowB: -6,
  };
}

function walk(p: number): Pose {
  const s = Math.sin(p);
  const c = Math.cos(p);
  return {
    thighF: -28 * s,
    kneeF: 44 * Math.max(0, c),
    thighB: 28 * s,
    kneeB: 44 * Math.max(0, -c),
    armF: 26 * s,
    elbowF: -24,
    armB: -26 * s,
    elbowB: -24,
  };
}

// Arms open out on takeoff, one forward and one back, and stay open for balance on the way down.
const JUMP: Pose = {
  thighF: -38,
  kneeF: 52,
  thighB: 6,
  kneeB: 34,
  armF: -58,
  elbowF: -22,
  armB: 52,
  elbowB: 18,
};

function fall(t: number): Pose {
  const w = Math.sin(t * 9) * 4;
  return {
    thighF: -14,
    kneeF: 16,
    thighB: 12,
    kneeB: 24,
    armF: -66 + w,
    elbowF: -16,
    armB: 62 - w,
    elbowB: 16,
  };
}

function wave(t: number): Pose {
  return { ...idle(t), armF: -158 + Math.sin(t * 16) * 16, elbowF: -18 };
}

function Limb({
  at,
  a,
  b,
  len1,
  len2,
  setRef,
  foot,
}: {
  at: number;
  a: Joint;
  b: Joint;
  len1: number;
  len2: number;
  setRef: (j: Joint, el: SVGGElement | null) => void;
  foot?: boolean;
}) {
  return (
    <g transform={`translate(0 ${at})`}>
      <g ref={(el) => setRef(a, el)}>
        <path d={`M0 0V${len1}`} />
        <g transform={`translate(0 ${len1})`}>
          <g ref={(el) => setRef(b, el)}>
            <path d={`M0 0V${len2}${foot ? "h8" : ""}`} />
          </g>
        </g>
      </g>
    </g>
  );
}

// ---- Controls hint ----------------------------------------------------
// Words and hand-drawn arrows laid out right-aligned, measured once the font has loaded.

type HintItem = string | { arrow: ArrowDir };
const CONTROLS_HINT: HintItem[] = [
  { arrow: "left" },
  { arrow: "right" },
  "walk ",
  { arrow: "up" },
  "jump ",
  { arrow: "down" },
  "drop",
];
const HINT_ARROW = 19;
const HINT_GAP = 5;

function HintLine({
  right,
  y,
  items,
}: {
  right: number;
  y: number;
  items: HintItem[];
}) {
  const parts = useRef<(SVGGElement | null)[]>([]);

  useLayoutEffect(() => {
    const layout = () => {
      const widths = parts.current.map((g, i) =>
        typeof items[i] === "string"
          ? (g?.querySelector("text")?.getComputedTextLength() ?? 0)
          : HINT_ARROW,
      );
      let x = right - widths.reduce((sum, w) => sum + w + HINT_GAP, -HINT_GAP);
      parts.current.forEach((g, i) => {
        g?.setAttribute("transform", `translate(${x.toFixed(1)} ${y})`);
        x += widths[i] + HINT_GAP;
      });
    };
    layout();
    document.fonts?.ready.then(layout);
  }, [items, right, y]);

  return (
    <g textAnchor="start">
      {items.map((item, i) => (
        <g key={i} ref={(el) => void (parts.current[i] = el)}>
          {typeof item === "string" ? (
            <text>{item}</text>
          ) : (
            <g
              transform={`translate(0 ${-HINT_ARROW * 0.72}) scale(${HINT_ARROW / 20})`}
            >
              <ArrowStrokes dir={item.arrow} color="#9a95a0" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

// ---- World -------------------------------------------------------------

export default function World({
  active,
  onOpen,
}: {
  active: boolean;
  onOpen: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const charRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);
  const noiseRef = useRef<SVGFETurbulenceElement>(null);
  const joints = useRef<Partial<Record<Joint, SVGGElement | null>>>({});

  const input = useRef<Input>({
    left: false,
    right: false,
    jump: false,
    down: false,
    interact: false,
  });
  const activeRef = useRef(active);
  const onOpenRef = useRef(onOpen);
  const nearRef = useRef<string | null>(null);
  const [near, setNear] = useState<string | null>(null);

  useEffect(() => {
    activeRef.current = active;
    onOpenRef.current = onOpen;
    if (!active)
      Object.assign(input.current, {
        left: false,
        right: false,
        jump: false,
        down: false,
        interact: false,
      });
  }, [active, onOpen]);

  // Keyboard
  useEffect(() => {
    const keys: Record<string, keyof Input> = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
      ArrowUp: "jump",
      w: "jump",
      W: "jump",
      " ": "jump",
      ArrowDown: "down",
      s: "down",
      S: "down",
      e: "interact",
      E: "interact",
      Enter: "interact",
    };
    const down = (e: KeyboardEvent) => {
      const k = keys[e.key];
      if (!k || !activeRef.current || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      if (k === "left" || k === "right" || !e.repeat) input.current[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = keys[e.key];
      if (k === "left" || k === "right") input.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const s = {
      x: START_X,
      y: FLOORS[0],
      vy: 0,
      floor: 0,
      grounded: true,
      facing: -1,
      dropFrom: -1,
      jumpBuf: 0,
      phase: 0,
      squash: 0,
      wave: 0,
      camX: 0,
      camY: 0,
      camReady: false,
      tail: 12,
      tailV: 0,
      pose: idle(0),
    };
    const view = { w: WORLD_W, h: WORLD_H, measured: false };

    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      const scale = Math.min(height / WORLD_H, width / MIN_VIEW_W);
      view.w = width / scale;
      view.h = height / scale;
      view.measured = true;
      s.camReady = false;
    });
    ro.observe(wrapRef.current!);

    let raf = 0;
    let last = performance.now();
    let boilAt = 0;
    let seed = 1;

    // Only touch the page when a value actually changes, so a resting scene costs almost nothing.
    const written = new WeakMap<Element, Map<string, string>>();
    const put = (el: Element | null | undefined, name: string, value: string) => {
      if (!el) return;
      let attrs = written.get(el);
      if (!attrs) written.set(el, (attrs = new Map()));
      if (attrs.get(name) === value) return;
      attrs.set(name, value);
      el.setAttribute(name, value);
    };
    // Round the tiny idle motions so standing still settles into very few updates.
    const deg = (v: number) => (Math.round(v * 2) / 2).toFixed(1);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // The first frame's timestamp can be a little before `last`; a negative step would fake a jump press.
      const dt = Math.max(0, Math.min(0.033, (now - last) / 1000));
      last = now;
      const t = now / 1000;
      if (!activeRef.current) return;
      const inp = input.current;

      // Movement
      const dir = s.wave > 0 ? 0 : (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (dir) s.facing = dir;
      s.x = Math.min(X_MAX, Math.max(X_MIN, s.x + dir * SPEED * dt));

      if (inp.jump) {
        s.jumpBuf = 0.12;
        inp.jump = false;
      }
      s.jumpBuf -= dt;
      if (s.grounded && s.jumpBuf > 0 && s.wave <= 0) {
        // Never jump higher than the page: near the top the hop is capped to the room above.
        const room = Math.max(0, s.y - CHAR_H - HEADROOM);
        s.vy = -Math.min(JUMP_V, Math.sqrt(2 * GRAVITY * room));
        s.grounded = false;
        s.jumpBuf = 0;
      }
      if (inp.down) {
        inp.down = false;
        if (s.grounded && s.floor > 0) {
          s.grounded = false;
          s.dropFrom = s.floor;
          s.vy = 60;
        }
      }
      if (!s.grounded) {
        const prevY = s.y;
        s.vy += (s.vy > 0 ? FALL_GRAVITY : GRAVITY) * dt;
        s.y += s.vy * dt;
        // Notebook lines are one-way platforms: pass through going up, land coming down.
        if (s.vy > 0) {
          for (let i = 0; i < FLOORS.length; i++) {
            if (i !== s.dropFrom && prevY <= FLOORS[i] && s.y >= FLOORS[i]) {
              s.y = FLOORS[i];
              s.vy = 0;
              s.grounded = true;
              s.floor = i;
              s.dropFrom = -1;
              s.squash = 1;
              break;
            }
          }
        }
      }

      // Nearby doodle
      let best: string | null = null;
      if (s.grounded) {
        let bestD = REACH;
        for (const e of entries) {
          const d = Math.abs(e.x - s.x);
          if (e.floor === s.floor && d < bestD) {
            bestD = d;
            best = e.id;
          }
        }
      }
      if (best !== nearRef.current) {
        nearRef.current = best;
        setNear(best);
      }
      if (inp.interact) {
        inp.interact = false;
        const id = nearRef.current;
        if (id && s.wave <= 0) {
          s.wave = 0.45;
          setTimeout(() => onOpenRef.current(id), 300);
        }
      }
      s.wave = Math.max(0, s.wave - dt);

      // Pose
      let target: Pose;
      if (!s.grounded) target = s.vy < 0 ? JUMP : fall(t);
      else if (s.wave > 0) target = wave(t);
      else if (dir) {
        s.phase += dt * 11;
        target = walk(s.phase);
      } else target = idle(t);
      const k = 1 - Math.exp(-dt * 18);
      for (const j of JOINTS) {
        s.pose[j] += (target[j] - s.pose[j]) * k;
        put(joints.current[j], "transform", `rotate(${deg(s.pose[j])})`);
      }
      s.squash = Math.max(0, s.squash - dt * 6);
      const sq = Math.sin(s.squash * Math.PI) * s.squash;
      put(
        charRef.current,
        "transform",
        `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) scale(${(s.facing * (1 + 0.1 * sq)).toFixed(3)} ${(1 - 0.14 * sq).toFixed(3)})`,
      );
      const bob = s.grounded
        ? dir
          ? -Math.abs(Math.sin(s.phase)) * 3
          : Math.sin(t * 2) * 0.8
        : 0;
      put(bodyRef.current, "transform", `translate(0 ${(Math.round(bob * 4) / 4).toFixed(2)})`);
      // Ponytail: trails behind when walking, floats up when falling, settles with a little bounce.
      const tailTarget =
        12 +
        (dir ? 22 : 0) +
        (s.grounded ? 0 : Math.max(-10, Math.min(65, s.vy * 0.05)));
      s.tailV += ((tailTarget - s.tail) * 160 - s.tailV * 11) * dt;
      s.tail += s.tailV * dt;
      put(tailRef.current, "transform", `rotate(${deg(s.tail)})`);
      const blink = t % 3.6 < 0.12 ? 0.1 : 1;
      put(
        eyesRef.current,
        "transform",
        `translate(0 -3) scale(1 ${blink}) translate(0 3)`,
      );

      // Camera
      let tx = (WORLD_W - view.w) / 2;
      if (view.w < WORLD_W)
        tx = Math.min(WORLD_W - view.w, Math.max(0, s.x - view.w / 2));
      const ty = view.h > WORLD_H ? -(view.h - WORLD_H) * 0.15 : 0;
      if (!s.camReady) {
        s.camX = tx;
        s.camY = ty;
        s.camReady = true;
      }
      s.camX += (tx - s.camX) * (1 - Math.exp(-dt * 6));
      s.camY = ty;
      put(
        svgRef.current,
        "viewBox",
        `${s.camX.toFixed(1)} ${s.camY.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}`,
      );
      // Show the page only once the camera fits the real size, so nothing pops into place on load.
      if (view.measured) put(svgRef.current, "visibility", "visible");

      // Line boil: nudge the sketch filter a few times a second
      if (!reduced && t > boilAt) {
        boilAt = t + 0.16;
        seed = (seed % 3) + 1;
        noiseRef.current?.setAttribute("seed", String(seed));
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const setJoint = useCallback((j: Joint, el: SVGGElement | null) => {
    joints.current[j] = el;
  }, []);

  // Touch pads: each button names its input in data-key; down presses, anything else releases.
  const onPad = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    input.current[e.currentTarget.dataset.key as keyof Input] =
      e.type === "pointerdown";
  };

  const rules = [];
  for (let y = -10 * RULE; y <= WORLD_H + 12 * RULE; y += RULE) rules.push(y);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <svg
        ref={svgRef}
        className="hand block h-full w-full select-none"
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        visibility="hidden"
        role="img"
        aria-label="A notebook page with a little stick figure. Walk with the arrow keys, jump with up, drop with down, and press E to open a doodle."
      >
        <Defs id="world" />
        <filter id="sketch-live" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            ref={noiseRef}
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="1"
          />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>

        {/* Paper */}
        {rules.map((y) => (
          <line
            key={y}
            x1={-2000}
            x2={WORLD_W + 2000}
            y1={y}
            y2={y}
            stroke={FLOORS.includes(y) ? "#b6cdea" : "#dbe7f6"}
            strokeWidth={FLOORS.includes(y) ? 2 : 1.5}
          />
        ))}
        <line
          x1={86}
          x2={86}
          y1={-2000}
          y2={3000}
          stroke="#f4a9a9"
          strokeWidth={2}
        />

        {/* Header, written on the lines */}
        <text x={120} y={74} fontSize={54} fill={INK}>
          Sona Sargsyan
        </text>
        <text x={122} y={114} fontSize={24} fill="#6b6672">
          Software Engineer at Snapchat
        </text>
        <g className="only-mouse" fontSize={21} fill="#9a95a0" textAnchor="end">
          <HintLine right={1160} y={74} items={CONTROLS_HINT} />
          <text x={1160} y={114}>
            E to open a doodle
          </text>
        </g>

        {/* Doodles: the drawings wobble, the handwriting stays put */}
        <g>
          {entries.map((e) => (
            <g
              key={e.id}
              transform={`translate(${e.x} ${FLOORS[e.floor]})`}
              className="doodle"
              role="button"
              tabIndex={active ? 0 : -1}
              aria-label={`Open ${e.title}`}
              onClick={() => active && onOpen(e.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  ev.stopPropagation();
                  onOpen(e.id);
                }
              }}
            >
              <rect
                x={-55}
                y={-e.h * DOODLE_SCALE - 10}
                width={110}
                height={e.h * DOODLE_SCALE + 46}
                fill="transparent"
              />
              <g
                filter="url(#sketch-live)"
                transform={`scale(${DOODLE_SCALE})`}
              >
                <Doodle kind={e.doodle} defs="world" />
              </g>
              <text y={33} textAnchor="middle" fontSize={22} fill={INK}>
                {e.label}
              </text>
            </g>
          ))}
        </g>

        {/* "Open me" bubble */}
        {entries
          .filter((e) => e.id === near)
          .map((e) => (
            <g
              key={e.id}
              transform={`translate(${e.x} ${FLOORS[e.floor] - e.h * DOODLE_SCALE - 26})`}
            >
              <g className="pop">
                <path
                  d="M-42 -34H42Q52 -34 52 -24V-8Q52 2 42 2H8L0 12L-6 2H-42Q-52 2 -52 -8V-24Q-52 -34 -42 -34Z"
                  fill="#fff"
                  stroke={INK}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                <text
                  y={-9}
                  textAnchor="middle"
                  fontSize={20}
                  fill={INK}
                  className="only-mouse"
                >
                  press E
                </text>
                <text
                  y={-9}
                  textAnchor="middle"
                  fontSize={20}
                  fill={INK}
                  className="only-touch"
                >
                  tap open
                </text>
              </g>
            </g>
          ))}

        {/* The kid */}
        <g
          ref={charRef}
          transform={`translate(${START_X} ${FLOORS[0]}) scale(-1 1)`}
          filter="url(#sketch-live)"
        >
          <g
            ref={bodyRef}
            fill="none"
            stroke={INK}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Limb
              at={-68}
              a="armB"
              b="elbowB"
              len1={16}
              len2={15}
              setRef={setJoint}
            />
            <Limb
              at={-38}
              a="thighB"
              b="kneeB"
              len1={20}
              len2={18}
              setRef={setJoint}
              foot
            />
            <path d="M0 -38V-74" />
            <Limb
              at={-38}
              a="thighF"
              b="kneeF"
              len1={20}
              len2={18}
              setRef={setJoint}
              foot
            />
            <g transform="translate(0 -92)">
              {/* Ponytail swings on a spring behind the head */}
              <g transform="translate(-14 -8)">
                <g ref={tailRef}>
                  <path
                    d="M0 0C-12 4 -15 18 -9 32C-4 26 -1 16 4 6Z"
                    fill={HAIR}
                    strokeWidth={2.5}
                  />
                </g>
              </g>
              <circle r={18} fill="#fff" />
              <path
                d="M15 -8C14 -22 -2 -26 -12 -19C-20 -13 -21 -1 -17 9L-11 5C-12 -3 -9 -9 -3 -11C2 -7 8 -6 15 -8Z"
                fill={HAIR}
                strokeWidth={2.5}
              />
              <path
                d="M-15 -11L-20 -17L-18 -7ZM-15 -11L-10 -18L-12 -8Z"
                fill="#ff8fb1"
                strokeWidth={2}
              />
              <g ref={eyesRef}>
                <circle cx={4} cy={-1} r={2.3} fill={INK} stroke="none" />
                <circle cx={11} cy={-1} r={2.3} fill={INK} stroke="none" />
              </g>
              <path d="M4.5 7Q8 10 11.5 7" strokeWidth={2.5} />
              <circle
                cx={1}
                cy={5}
                r={2.8}
                fill="#ff8fb1"
                opacity={0.5}
                stroke="none"
              />
              <circle
                cx={15}
                cy={5}
                r={2.8}
                fill="#ff8fb1"
                opacity={0.5}
                stroke="none"
              />
            </g>
            <Limb
              at={-68}
              a="armF"
              b="elbowF"
              len1={16}
              len2={15}
              setRef={setJoint}
            />
          </g>
        </g>
      </svg>

      {/* Touch controls */}
      <div className="only-touch-flex pointer-events-none absolute inset-x-0 bottom-0 justify-between p-4">
        <div className="pointer-events-auto flex gap-3">
          {[
            { key: "left", label: <Arrow dir="left" />, name: "Walk left" },
            { key: "right", label: <Arrow dir="right" />, name: "Walk right" },
          ].map((b) => (
            <button
              key={b.key}
              className="pad"
              aria-label={b.name}
              data-key={b.key}
              onPointerDown={onPad}
              onPointerUp={onPad}
              onPointerLeave={onPad}
              onPointerCancel={onPad}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto flex gap-3">
          {near && (
            <button
              className="pad pad-open"
              data-key="interact"
              onPointerDown={onPad}
            >
              open
            </button>
          )}
          <button
            className="pad"
            aria-label="Drop down"
            data-key="down"
            onPointerDown={onPad}
          >
            <Arrow dir="down" />
          </button>
          <button
            className="pad"
            aria-label="Jump"
            data-key="jump"
            onPointerDown={onPad}
          >
            <Arrow dir="up" />
          </button>
        </div>
      </div>
    </div>
  );
}
