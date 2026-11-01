import { GROUP_LABEL } from "@/lib/event";
import type { BracketRow, GroupCode } from "@/lib/types";
import { SectionTitle } from "./SectionTitle";

type Slot = { name: string | null; rank: number | null };

function slotsFor(rows: BracketRow[], group: GroupCode, size: number): Slot[] {
  const list = rows.filter((r) => r.group_code === group).sort((a, b) => a.position - b.position);
  return Array.from({ length: size }, (_, i) => ({ name: list[i]?.community_name ?? null, rank: list[i]?.rank ?? null }));
}

const STEPS = [
  {
    n: "1",
    t: "Kualifikasi",
    d: "15 tim diundi ke 3 match, masing-masing 5 tim. Peringkat 1–3 tiap match lolos, 2 tim terbawah gugur.",
  },
  {
    n: "2",
    t: "Semifinal",
    d: "9 tim yang lolos diundi ulang menjadi 3 match berisi 3 tim. Juara 1 tiap match melaju ke final.",
  },
  {
    n: "3",
    t: "Final",
    d: "3 juara semifinal bertanding dalam satu race untuk memperebutkan Juara 1, 2, dan 3.",
  },
];

export function Bracket({ rows }: { rows: BracketRow[] }) {
  const drawn = rows.length > 0;
  return (
    <section id="bagan" className="relative scroll-mt-20 overflow-hidden bg-brand-ink py-20 text-white lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_85%_0%,rgba(51,133,206,0.35),transparent_70%),radial-gradient(600px_400px_at_0%_100%,rgba(127,208,255,0.12),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            light
            kicker="Sistem Klasifikasi"
            title={
              <>
                Dari 15 tim, <span className="text-brand-ice">tersisa 1 juara.</span>
              </>
            }
            desc="Format gugur 3 tahap untuk lomba relay. Bagan di bawah otomatis terisi setelah panitia melakukan undian."
          />
          <span
            className={`self-start rounded-full px-4 py-2 text-xs font-bold tracking-[0.15em] lg:self-auto ${
              drawn ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/40" : "bg-white/10 text-white/70 ring-1 ring-white/20"
            }`}
          >
            {drawn ? "● HASIL UNDIAN TERBARU" : "○ MENUNGGU UNDIAN"}
          </span>
        </div>

        {/* langkah */}
        <ol className="mt-10 grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-extrabold">{s.n}</span>
                <span className="display text-2xl">{s.t}</span>
              </div>
              <p className="mt-3 text-sm text-white/75">{s.d}</p>
            </li>
          ))}
        </ol>

        {/* bagan */}
        <div className="mt-8 grid items-stretch gap-4 lg:gap-5 lg:grid-cols-[1.35fr_auto_1fr_auto_0.95fr]">
          <Column title="Kualifikasi" tag="15 TIM · 3 MATCH">
            {(["A", "B", "C"] as const).map((g) => (
              <MatchCard key={g} code={g} slots={slotsFor(rows, g, 5)} stage="kualifikasi" />
            ))}
          </Column>

          <Arrow label={["TOP 3 LOLOS", "DRAW ULANG"]} />

          <Column title="Semifinal" tag="9 TIM · 3 MATCH">
            {(["S1", "S2", "S3"] as const).map((g) => (
              <MatchCard key={g} code={g} slots={slotsFor(rows, g, 3)} stage="semifinal" />
            ))}
          </Column>

          <Arrow label={["JUARA 1", "TIAP MATCH"]} />

          <Column title="Final" tag="3 TIM">
            <FinalCard slots={slotsFor(rows, "F", 3)} />
          </Column>
        </div>
      </div>
    </section>
  );
}

function Column({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center gap-3">
        <h3 className="display text-2xl">{title}</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white/80">{tag}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Arrow({ label }: { label: [string, string] }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1 text-brand-ice lg:flex-col lg:pt-8">
      <svg viewBox="0 0 24 24" className="h-8 w-8 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
      <span className="text-center text-[11px] font-extrabold leading-tight tracking-[0.12em]">
        {label[0]}
        <br className="hidden lg:block" /> {label[1]}
      </span>
    </div>
  );
}

function MatchCard({ code, slots, stage }: { code: GroupCode; slots: Slot[]; stage: "kualifikasi" | "semifinal" }) {
  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-ink via-brand-navy to-brand-deep shadow-xl ring-1 ring-white/10">
      <div className="flex w-24 shrink-0 flex-col justify-center bg-white/[0.06] px-4 [clip-path:polygon(0_0,100%_0,86%_100%,0_100%)]">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-white/60">{stage === "kualifikasi" ? "MATCH" : "SEMI"}</span>
        <span className="display text-3xl leading-none">{GROUP_LABEL[code].split(" ").pop()}</span>
      </div>
      <ul className="flex flex-1 flex-col justify-center gap-1 py-2 pr-3">
        {slots.map((s, i) => {
          const out = stage === "kualifikasi" ? s.rank !== null && s.rank > 3 : s.rank !== null && s.rank > 1;
          const through = stage === "kualifikasi" ? s.rank !== null && s.rank <= 3 : s.rank === 1;
          return (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] ${
                s.name ? (out ? "bg-white/5 text-white/40 line-through" : "bg-white/10") : "border border-dashed border-white/20 text-white/40"
              }`}
            >
              <span className="w-4 text-xs font-bold text-white/50">{i + 1}</span>
              <span className="flex-1 truncate font-semibold">{s.name ?? `Slot ${i + 1}`}</span>
              {through && (
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 no-underline">
                  {stage === "kualifikasi" ? `#${s.rank} LOLOS` : "KE FINAL"}
                </span>
              )}
              {out && <span className="text-[10px] font-bold text-red-300/80 no-underline">GUGUR</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const MEDAL = ["bg-amber-300 text-amber-950", "bg-slate-200 text-slate-800", "bg-orange-300 text-orange-950"];

function FinalCard({ slots }: { slots: Slot[] }) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-gradient-to-b from-brand to-brand-deep p-4 shadow-xl ring-1 ring-white/20">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-white/70">GRAND FINAL</span>
      <ul className="mt-2 space-y-1.5">
        {slots.map((s, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold ${
              s.name ? "bg-white/15" : "border border-dashed border-white/30 text-white/50"
            }`}
          >
            <span className="flex-1 truncate">{s.name ?? `Juara Semifinal ${i + 1}`}</span>
            {s.rank && s.rank <= 3 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${MEDAL[s.rank - 1]}`}>JUARA {s.rank}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
