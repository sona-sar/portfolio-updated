"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION = 950;

type Pt = [number, number];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];

/** Keep the part of `poly` on one side of the line through `m` with normal `n` (Sutherland–Hodgman). */
function clip(poly: Pt[], m: Pt, n: Pt, sign: 1 | -1): Pt[] {
  const side = (p: Pt) => sign * dot([p[0] - m[0], p[1] - m[1]], n);
  const out: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa >= 0) out.push(a);
    if (sa >= 0 !== sb >= 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  });
  return out;
}

const polygon = (pts: Pt[]) =>
  pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

/**
 * Flipbook-style page turn, the way turn.js / StPageFlip do it: the bottom-right
 * corner is pulled across the page. The fold line is the perpendicular bisector
 * between where the corner started and where it is now. The sheet is cut along
 * that line, and the cut-off flap is mirrored over it to show the back of the paper.
 *
 * "fwd" pulls the current sheet away; "back" brings a sheet in from the left.
 */
export default function PageTurn({
  source,
  dir,
  onDone,
}: {
  source: string;
  dir: "fwd" | "back";
  onDone: () => void;
}) {
  const flapWrapRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const flapShadeRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);

  useLayoutEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useLayoutEffect(() => {
    const sheet = document.querySelector<HTMLElement>(`[data-sheet="${source}"]`)!;
    const W = sheet.offsetWidth;
    const H = sheet.offsetHeight;
    const rect: Pt[] = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ];
    const corner: Pt = [W, H];
    const t0 = performance.now();
    let raf = 0;
    let alive = true;

    const render = (now: number) => {
      if (!alive) return;
      const p = Math.min(1, (now - t0) / DURATION);
      const q = dir === "fwd" ? p : 1 - p; // 0 = page lying flat, 1 = turned over to the left
      const e = ease(q);
      // Where the grabbed corner is: it travels left and lifts a little mid-turn.
      const c: Pt = [W - 2 * W * e, H - H * 0.22 * Math.sin(Math.PI * e)];
      const d: Pt = [corner[0] - c[0], corner[1] - c[1]];
      const len = Math.hypot(d[0], d[1]);

      const flapWrap = flapWrapRef.current!;
      if (len < 0.5) {
        sheet.style.clipPath = "";
        flapWrap.style.visibility = "hidden";
        castRef.current!.style.opacity = "0";
      } else {
        const n: Pt = [d[0] / len, d[1] / len]; // points from the fold toward the original corner
        const m: Pt = [(corner[0] + c[0]) / 2, (corner[1] + c[1]) / 2];
        const angle = (Math.atan2(n[1], n[0]) * 180) / Math.PI;

        // The part still lying flat stays on the page; the rest is folded over.
        sheet.style.clipPath = polygon(clip(rect, m, n, -1));

        // Mirror the cut-off part across the fold line: x' = x - 2((x - m)·n)n
        const k = 2 * dot(m, n);
        const flap = flapRef.current!;
        flap.style.transform = `matrix(${1 - 2 * n[0] * n[0]},${-2 * n[0] * n[1]},${-2 * n[0] * n[1]},${1 - 2 * n[1] * n[1]},${k * n[0]},${k * n[1]})`;
        flap.style.clipPath = polygon(clip(rect, m, n, 1));
        flapWrap.style.visibility = "visible";
        if (dir === "fwd") {
          // Turning away, the page wraps around the spiral: it's cut off at the spine as it goes.
          flapWrap.style.clipPath = "inset(-100px -100px -100px 0)";
        } else {
          // Coming back, it fades in from the left as it swings over.
          flapWrap.style.opacity = Math.min(1, (1 - q) / 0.25).toFixed(3);
        }

        // Curvature shading on the flap, darkest right at the fold.
        const reach = Math.min(160, len * 0.5);
        const shade = flapShadeRef.current!;
        shade.style.transform = `translate(${m[0]}px, ${m[1]}px) rotate(${angle}deg)`;
        shade.style.background = `linear-gradient(90deg, rgba(45,42,50,0.2), rgba(45,42,50,0.04) ${reach * 0.4}px, rgba(255,255,255,0) ${reach}px, rgba(45,42,50,0.06) ${len}px)`;

        // The lifted page throws a shadow onto the sheet being revealed underneath.
        const cast = castRef.current!;
        cast.style.opacity = "1";
        cast.style.transform = `translate(${m[0]}px, ${m[1]}px) rotate(${angle}deg)`;
        cast.style.background = `linear-gradient(90deg, rgba(45,42,50,${(0.3 * Math.sin(Math.PI * q)).toFixed(3)}), rgba(45,42,50,0) ${Math.max(24, reach * 0.9)}px)`;
      }

      if (p < 1) raf = requestAnimationFrame(render);
      else doneRef.current();
    };
    render(t0); // draws the first frame and schedules the rest

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      sheet.style.clipPath = "";
    };
  }, [source, dir]);

  return (
    <>
      {/* Shadow on the revealed sheet. It sits under the turning sheet, so it only shows where that sheet is cut away. */}
      <div className="flip-cast-clip" aria-hidden>
        <div ref={castRef} className="flip-band" />
      </div>
      <div ref={flapWrapRef} className="flip-flap-wrap" aria-hidden>
        <div ref={flapRef} className="flip-flap">
          <div ref={flapShadeRef} className="flip-band" />
        </div>
      </div>
    </>
  );
}
