"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { entries, groupNames, type Entry } from "./data";
import { Arrow, Defs, Doodle, LinkIcon, Logo } from "./doodles";
import PageTurn from "./page-turn";
import World from "./world";

type Turn = { from: string; to: string; dir: "fwd" | "back" };

// One line of the contents: a name, dotted leader, and dates on the right. Opens a page when clicked.
function TocRow({
  name,
  meta,
  onClick,
}: {
  name: React.ReactNode;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button className="toc-row" onClick={onClick}>
      <span className="toc-name">{name}</span>
      <span className="toc-dots" />
      <span className="toc-meta">{meta ?? <Arrow dir="right" />}</span>
    </button>
  );
}

const byId = (id: string) => entries.find((e) => e.id === id)!;

/** The contents follow the resume: Education, Experience, Projects, Skills, Hackathons. */
function Contents({ onOpen }: { onOpen: (id: string) => void }) {
  const education = byId("education");
  const skills = byId("skills");
  const hackathons = byId("hackathons");
  // The data lists work oldest first (that's how the world climbs); the resume reads newest first.
  const work = entries.filter((e) => e.group === "work").reverse();
  const projects = entries.filter((e) => e.group === "projects");

  return (
    <div className="toc">
      <h1 className="page-title">Contents</h1>

      <section>
        <h2 className="toc-head">Education</h2>
        {education.schools?.map((school) => (
          <div key={school.name}>
            <TocRow
              name={school.name}
              meta={school.dates}
              onClick={() => onOpen(education.id)}
            />
            <p className="toc-sub">{school.detail}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="toc-head">Professional Experience</h2>
        {work.map((job) => (
          <div key={job.id}>
            <TocRow
              name={job.title}
              meta={job.dates}
              onClick={() => onOpen(job.id)}
            />
            <p className="toc-sub">{job.subtitle}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="toc-head">Projects</h2>
        {projects.map((project) => (
          <TocRow
            key={project.id}
            name={
              <>
                {project.title}
                {project.tags && (
                  <span className="toc-stack">
                    {" "}
                    | {project.tags.join(", ")}
                  </span>
                )}
              </>
            }
            onClick={() => onOpen(project.id)}
          />
        ))}
      </section>

      <section>
        <h2 className="toc-head">Skills</h2>
        {skills.points?.map((line) => {
          const [label, list] = line.split(": ");
          return (
            <button
              key={label}
              className="toc-wrap"
              onClick={() => onOpen(skills.id)}
            >
              <span className="toc-label">{label}:</span>{" "}
              <span className="toc-stack">{list}</span>
            </button>
          );
        })}
      </section>

      <section>
        <h2 className="toc-head">Hackathons</h2>
        {hackathons.points?.map((win) => (
          <TocRow
            key={win}
            name={win.replace(/\.$/, "")}
            meta={hackathons.dates}
            onClick={() => onOpen(hackathons.id)}
          />
        ))}
      </section>
    </div>
  );
}

function EntryPage({ entry }: { entry: Entry }) {
  // Same line boil as the world: nudge the sketch filter a few times a second.
  const noiseRef = useRef<SVGFETurbulenceElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seed = 1;
    const id = setInterval(() => {
      seed = (seed % 3) + 1;
      noiseRef.current?.setAttribute("seed", String(seed));
    }, 160);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* A plain page still keeps the crayon defs around for its school logos. */}
      <svg
        className={entry.plainPage ? undefined : "page-doodle"}
        viewBox="-75 -135 150 150"
        {...(entry.plainPage && {
          width: 0,
          height: 0,
          style: { position: "absolute" },
        })}
        aria-hidden
      >
        <Defs id={`page-${entry.id}`} noiseRef={noiseRef} />
        {!entry.plainPage && (
          <g filter={`url(#page-${entry.id}-sketch)`}>
            <Doodle kind={entry.doodle} defs={`page-${entry.id}`} />
          </g>
        )}
      </svg>
      <p className="page-kicker">{groupNames[entry.group]}</p>
      {/* The school names head the education page themselves */}
      {entry.schools ? <h1 className="sr-only">{entry.title}</h1> : <h1 className="page-title">{entry.title}</h1>}
      {entry.subtitle && <p className="page-sub">{entry.subtitle}</p>}
      {entry.places?.map((place) => (
        <p key={place.text} className="page-sub">
          {place.text}
          <Logo kind={place.flag} defs={`page-${entry.id}`} />
        </p>
      ))}
      {entry.dates && <p className="page-dates">{entry.dates}</p>}
      {entry.schools?.map((school) => (
        <section key={school.name} className="school">
          <h2 className="page-sub">
            {school.name}
            <Logo kind={school.logo} defs={`page-${entry.id}`} />
          </h2>
          <p>{school.detail}</p>
          <p className="page-dates">
            {school.place} · {school.dates}
          </p>
        </section>
      ))}
      {entry.points && (
        <ul className="page-points">
          {entry.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {entry.tags && (
        <p className="page-tags">
          {entry.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
      )}
      {entry.links && (
        <ul className="page-links">
          {entry.links.map((l) => (
            <li key={l.href} style={l.icon && { display: "flex", alignItems: "center", gap: 10 }}>
              {l.icon && <LinkIcon kind={l.icon} />}
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label} <Arrow dir="up-right" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {entry.photos && (
        <div className={entry.photosBeside ? "photos photos-beside" : "photos"}>
          {entry.photos.map((photo, i) => {
            const spot = PHOTO_SPOTS[i % PHOTO_SPOTS.length];
            const strip = TAPE_STRIPS[i % TAPE_STRIPS.length];
            const tapeStyle = {
              "--len": `${strip.len}px`,
              "--jitter": `${strip.jitter}deg`,
              "--shift": `${strip.shift}px`,
            } as React.CSSProperties;
            const style = {
              "--tilt": `${photo.tilt ?? spot.tilt}deg`,
              "--dx": `${spot.dx}px`,
              "--dy": `${spot.dy}px`,
            } as React.CSSProperties;
            return (
              <figure key={photo.src} className="photo" style={style}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.w ?? 794}
                  height={photo.h ?? 489}
                  sizes="(max-width: 640px) 80vw, 300px"
                />
                <span
                  className={`tape tape-torn-${strip.torn}`}
                  style={tapeStyle}
                />
              </figure>
            );
          })}
        </div>
      )}
    </>
  );
}

// Where each taped photo lands: its own lean, and a nudge off the grid so the row looks stuck on by hand.
const PHOTO_SPOTS = [
  { tilt: -4, dx: 0, dy: 22 },
  { tilt: 3, dx: -6, dy: -10 },
  { tilt: -2, dx: -14, dy: 30 },
  { tilt: 2.5, dx: 4, dy: 0 },
];

// One strip of tape across the top of each photo, no two alike: length, angle, a slight slide, torn edge.
const TAPE_STRIPS = [
  { len: 70, jitter: -6, shift: -4, torn: 1 },
  { len: 62, jitter: 5, shift: 6, torn: 2 },
  { len: 66, jitter: -3, shift: 2, torn: 2 },
  { len: 74, jitter: 7, shift: -2, torn: 1 },
];

export default function Notebook() {
  const [view, setView] = useState("world");
  const [turn, setTurn] = useState<Turn | null>(null);
  const busy = useRef(false);
  const current = useRef("world");

  const go = useCallback((to: string) => {
    if (busy.current || to === current.current) return;
    const from = current.current;
    current.current = to;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setView(to);
      return;
    }
    busy.current = true;
    setTurn({ from, to, dir: to === "world" ? "back" : "fwd" });
  }, []);

  const finishTurn = useCallback(() => {
    setView(current.current);
    setTurn(null);
    busy.current = false;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") go("world");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // While turning, the sheet being revealed lies flat and the turning sheet sits above it,
  // cut along the fold. The folded flap (the back of the paper) is drawn by PageTurn.
  const turning = turn ? (turn.dir === "fwd" ? turn.from : turn.to) : null;
  const under = turn ? (turn.dir === "fwd" ? turn.to : turn.from) : view;
  const pages = [...new Set([under, turning])].filter(
    (id): id is string => !!id && id !== "world",
  );
  const shown = turn ? turn.to : view;
  const layer = (id: string) => (id === turning ? 3 : id === under ? 2 : 1);

  return (
    <div className="notebook">
      <nav className="tabs" aria-label="Notebook tabs">
        {[
          { id: "world", label: "my world", color: "#ffe27a" },
          { id: "index", label: "contents", color: "#bfdcff" },
          { id: "contact", label: "say hi", color: "#ffc4d6" },
        ].map((t) => (
          <button
            key={t.id}
            className="tab"
            data-active={shown === t.id}
            onClick={(e) => {
              // Drop focus so walking with the keys afterwards doesn't draw a focus ring on the tab.
              e.currentTarget.blur();
              go(t.id);
            }}
          >
            {/* Only the face slides; the button itself stays put. */}
            <span className="tab-face" style={{ background: t.color }}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="stack">
        <div
          className="sheet"
          data-sheet="world"
          style={{ zIndex: layer("world") }}
        >
          <World active={view === "world" && !turn} onOpen={go} />
        </div>
        {pages.map((id) => (
          <div
            key={id}
            className="sheet"
            data-sheet={id}
            style={{ zIndex: layer(id) }}
          >
            <article className="page hand">
              <button className="page-back" onClick={() => go("world")}>
                <Arrow dir="left" /> back to my world
              </button>
              {id === "index" ? (
                <Contents onOpen={go} />
              ) : (
                <EntryPage entry={entries.find((e) => e.id === id)!} />
              )}
            </article>
          </div>
        ))}
        {turn && turning && (
          <PageTurn
            key={`${turn.from}>${turn.to}`}
            source={turning}
            dir={turn.dir}
            onDone={finishTurn}
          />
        )}
      </div>
      <div className="spiral" aria-hidden />
    </div>
  );
}
