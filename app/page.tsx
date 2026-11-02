import Notebook from "./notebook";
import { entries } from "./data";

export default function Home() {
  return (
    <main className="flex h-dvh w-full items-start justify-center overflow-hidden px-4">
      <Notebook />
      {/* Plain-text copy of the notebook for search engines and screen readers */}
      <div className="sr-only">
        <h1>Sona Sargsyan, Software Engineer</h1>
        {entries.map((e) => (
          <section key={e.id}>
            <h2>{e.title}</h2>
            {e.subtitle && <p>{e.subtitle}</p>}
            {e.places?.map((place) => <p key={place.text}>{place.text}</p>)}
            {e.dates && <p>{e.dates}</p>}
            {e.points?.map((p) => <p key={p}>{p}</p>)}
            {e.schools?.map((school) => (
              <p key={school.name}>
                {school.name}, {school.detail}, {school.place}, {school.dates}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
