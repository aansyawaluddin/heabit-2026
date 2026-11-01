import Image from "next/image";
import { PRIZES } from "@/lib/event";
import { SectionTitle } from "./SectionTitle";

export function Prizes() {
  return (
    <section id="hadiah" className="scroll-mt-20 bg-brand-sky py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle center kicker="Podium HEABIT" title="Total hadiah podium" />
        <p className="display mt-4 text-center text-5xl text-brand sm:text-7xl">{PRIZES.total}</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PRIZES.categories.map((c) => (
            <div key={c.name} className="card overflow-hidden">
              <div className="flex items-center justify-between bg-brand-navy px-6 py-4 text-white">
                <h3 className="display text-3xl">{c.name}</h3>
                <span className="text-xs font-bold tracking-[0.18em] text-brand-ice">JUARA 1 · 2 · 3</span>
              </div>
              <div className="px-6 pb-6 pt-8">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[1, 0, 2].map((i) => (
                    <div key={i}>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Juara {i + 1}</p>
                      <p className={`mt-1 whitespace-nowrap font-extrabold text-brand-navy ${i === 0 ? "text-base sm:text-2xl" : "text-sm sm:text-lg"}`}>
                        {c.prizes[i]}
                      </p>
                    </div>
                  ))}
                </div>
                <Image src="/img/podium.png" alt="" width={800} height={265} className="mx-auto mt-4 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
