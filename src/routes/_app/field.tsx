import { DOCTRINE_STACK, FIELD_STUDIES } from "@/data/doctrine";
import { SHARE_MODE } from "@/data/share-mode";
import { searchBank, SOURCE_NAMES, TERRAIN_LIBRARY, TOPICS, type BankTopic } from "@/data/bank-rules";
import { PHASES, phaseFor } from "@/data/knowledge-bank";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_app/field")({
  component: FieldPage,
});

function FieldPage() {
  const phase = useMemo(() => phaseFor(), []);
  const [open, setOpen] = useState(FIELD_STUDIES[0]?.id ?? "herndon");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<BankTopic | "all">("all");
  const study = FIELD_STUDIES.find((s) => s.id === open) ?? FIELD_STUDIES[0];
  const textSearch = query.trim().length > 0;
  const hits = useMemo(() => searchBank(query, topic, textSearch ? undefined : open), [query, topic, textSearch, open]);
  const hunterHits = textSearch ? hits : searchBank("", topic, open);

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">KNOWLEDGE BANK</p>
        <h1 className="mt-1 font-display text-lg uppercase tracking-wide text-fg">Field studies</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Six operating systems extracted from the field-study PDFs. Terrain picks the choke. Habitat builds the
          grocery and the hallway. Sanctuary decides if you leave the house. Phase rates the day. The daily call never
          name-drops — it just runs the stack.
        </p>
        <div className="mt-4 rounded-md border border-border bg-deep px-4 py-3">
          <p className="font-display text-xs tracking-[0.2em] text-accent">
            TODAY · PHASE {phase.id || "0"}
          </p>
          <p className="mt-1 font-display text-base uppercase tracking-wide text-fg">{phase.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{phase.hunt}</p>
        </div>

        <label className="mt-4 block">
          <span className="font-display text-xs tracking-[0.22em] text-accent">SEARCH</span>
          <span className="relative mt-2 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SHARE_MODE ? "Search wind, sanctuary, staging…" : "Search wind, sanctuary, beans, Braswell…"}
              className="h-11 w-full rounded-md border border-border bg-bg pl-10 pr-3 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.filter((t) => !SHARE_MODE || t.id !== "anson").map((t) => {
            const on = topic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className={`min-h-11 rounded-md border px-3 font-display text-xs uppercase tracking-wide ${
                  on ? "border-accent bg-raised text-fg" : "border-border bg-bg text-muted"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">THE STACK</p>
        <ul className="mt-3 space-y-3">
          {DOCTRINE_STACK.map((row) => (
            <li key={row.q}>
              <p className="text-sm text-fg">{row.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{row.a}</p>
            </li>
          ))}
        </ul>
      </section>

      {!SHARE_MODE ? (
      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">THE BOOK</p>
        <h2 className="mt-1 font-display text-base uppercase tracking-wide text-fg">
          How a mature buck is killed on purpose
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          One book. Six chairs at one table. Not six stacked studies. The map, the bedroom, the grocery,
          the calendar, the hallway, and the maze written as a single hunting book — then applied to Anson
          and Buffalo Creek.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/field-studies/book/index.html"
            className="inline-flex min-h-11 items-center rounded-md border border-accent bg-raised px-4 font-display text-xs uppercase tracking-wide text-fg"
          >
            Read the book
          </a>
          <a
            href="/field-studies/book/HuntBrief-Field-Studies-BOOK.txt"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-bg px-4 font-display text-xs uppercase tracking-wide text-muted"
          >
            Plain text
          </a>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FIELD_STUDIES.map((s) => (
            <li key={s.id}>
              <a
                href={s.pdf}
                className="block min-h-11 rounded-md border border-border bg-bg px-3 py-2 font-display text-xs uppercase tracking-wide text-muted"
              >
                {s.name} PDF
              </a>
            </li>
          ))}
        </ul>
      </section>
      ) : (
      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">FIELD STUDIES</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Club briefing. The personal hunting book stays on the private app.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FIELD_STUDIES.map((s) => (
            <li key={s.id}>
              <a
                href={s.pdf}
                className="block min-h-11 rounded-md border border-border bg-bg px-3 py-2 font-display text-xs uppercase tracking-wide text-muted"
              >
                {s.name} PDF
              </a>
            </li>
          ))}
        </ul>
      </section>
      )}

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">WHO</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FIELD_STUDIES.map((s) => {
            const on = s.id === open && !textSearch;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setOpen(s.id);
                  setQuery("");
                  setTopic("all");
                }}
                className={`min-h-14 rounded-md border px-3 py-3 text-left ${
                  on ? "border-accent bg-raised text-fg" : "border-border bg-bg text-muted"
                }`}
              >
                <span className="font-display text-xs uppercase tracking-wide">{s.name}</span>
                <span className="mt-1 block text-xs leading-snug text-muted">{s.chair}</span>
              </button>
            );
          })}
        </div>
      </section>

      {textSearch ? (
        <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
          <p className="font-display text-xs tracking-[0.22em] text-accent">BANK HITS</p>
          <p className="mt-1 text-sm text-muted">
            {hits.length} rule{hits.length === 1 ? "" : "s"} from the field studies
          </p>
          {hits.length ? (
            <ul className="mt-4 space-y-3">
              {hits.map((r) => (
                <li key={r.id} className="rounded-sm border border-border bg-bg px-3 py-3">
                  <p className="font-display text-xs tracking-[0.16em] text-fair">
                    {SOURCE_NAMES[r.source]} · {r.topic}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">{r.rule}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              No rule matches. Try wind, sanctuary, beans, Braswell, or a hunter name.
            </p>
          )}
        </section>
      ) : study ? (
        <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
          <p className="font-display text-xs tracking-[0.22em] text-accent">{study.role.toUpperCase()}</p>
          <h2 className="mt-1 font-display text-xl uppercase tracking-wide text-fg">{study.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-fg">{study.sentence}</p>

          <p className="mt-5 font-display text-xs tracking-[0.2em] text-fair">OPERATING SYSTEM</p>
          <ol className="mt-3 space-y-2">
            {study.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="font-display text-accent">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 font-display text-xs tracking-[0.2em] text-fair">ON THE ANSON FARM</p>
          <ul className="mt-3 space-y-2">
            {study.anson.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-muted">
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-5 font-display text-xs tracking-[0.2em] text-fair">
            FROM THE PDF{topic !== "all" ? ` · ${topic}` : ""}
          </p>
          <ul className="mt-3 space-y-3">
            {hunterHits.map((r) => (
              <li key={r.id} className="rounded-sm border border-border bg-bg px-3 py-3">
                <p className="font-display text-xs tracking-[0.16em] text-fair">{r.topic}</p>
                <p className="mt-2 text-sm leading-relaxed text-fg">{r.rule}</p>
              </li>
            ))}
          </ul>

          <a
            href={study.pdf}
            download
            className="mt-5 inline-flex min-h-11 items-center rounded-md border border-accent bg-raised px-4 font-display text-xs uppercase tracking-[0.16em] text-accent"
          >
            Download field study
          </a>
        </section>
      ) : null}

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">TERRAIN LIBRARY</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Herndon map features. A primary stand names the choke, the concealed path, the scent dump, and the walk.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {TERRAIN_LIBRARY.map((f) => (
            <li key={f.id} className="rounded-sm border border-border bg-bg px-3 py-3">
              <p className="font-display text-sm uppercase tracking-wide text-fg">{f.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{f.map}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg">{f.sit}</p>
              <p className="mt-1 text-xs leading-relaxed text-poor">Kill: {f.kill}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
        <p className="font-display text-xs tracking-[0.22em] text-accent">THIRTEEN PHASES</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Midwest skeleton used on this farm. Hunt the personality of the phase, not the November cliché.
        </p>
        <ol className="mt-4 space-y-2">
          {PHASES.map((p) => {
            const on = p.id === phase.id;
            return (
              <li
                key={p.id}
                className={`rounded-sm border px-3 py-3 ${on ? "border-accent bg-raised" : "border-border bg-bg"}`}
              >
                <p className="font-display text-sm uppercase tracking-wide text-fg">
                  {p.id}. {p.name}
                  <span className="ml-2 font-sans text-xs tracking-normal text-muted">{p.window}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.hunt}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
