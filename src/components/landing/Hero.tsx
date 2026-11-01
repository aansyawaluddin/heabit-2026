import Image from "next/image";
import { EVENT } from "@/lib/event";
import type { PublicStats } from "@/lib/types";
import { Countdown } from "./Countdown";

export function Hero({ stats }: { stats: PublicStats }) {
  const left = Math.max(0, stats.quota - stats.registered);
  return (
    <section className="bg-hero relative overflow-hidden pb-16 pt-28 text-white lg:pb-24 lg:pt-36">
      <div className="bg-dots pointer-events-none absolute right-6 top-24 h-40 w-64 opacity-60 [mask-image:linear-gradient(135deg,transparent_15%,#000_70%)]" />
      <div className="pointer-events-none absolute -left-40 top-[58%] h-56 w-[140%] -rotate-6 bg-gradient-to-b from-transparent via-white/15 to-transparent blur-md" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="kicker">{EVENT.edition} · 2026</span>
          <h1 className="display mt-5 text-6xl leading-[0.92] [text-shadow:0_6px_0_rgba(13,32,59,0.25)] sm:text-7xl lg:text-8xl">
            HEABIT
            <br />
            <span className="text-brand-navy [text-shadow:none]">2026</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium text-white/90">
            Heavan Bitte <b>Relay &amp; Cheering Competition</b> — adu cepat, kompak, dan paling heboh antar komunitas lari
            Makassar di penghujung tahun.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            <li className="rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/25">📅 {EVENT.dateLabel}</li>
            <li className="rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/25">⏰ {EVENT.time}</li>
            <li className="rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/25">📍 {EVENT.venue}, CPI</li>
          </ul>

          <div className="mt-8">
            <Countdown dateISO={EVENT.dateISO} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#bagan" className="btn border border-white/40 px-6 py-4 text-base text-white hover:bg-white/10">
              Lihat Sistem Lomba
            </a>
          </div>
          <p className="mt-4 text-sm font-semibold text-brand-ice">
            {left > 0 ? `Sisa ${left} dari ${stats.quota} slot komunitas` : `Seluruh ${stats.quota} slot komunitas telah terisi`}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/20 [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%,0_10%)]">
            <Image src="/img/hero.webp" alt="Pelari Heavan Run di garis start" fill priority sizes="(min-width:1024px) 560px, 90vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
            <div className="absolute right-5 top-5 rounded-2xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
              <Image src="/img/logo-run.png" alt="Heavan Run" width={200} height={80} className="h-10 w-auto" />
            </div>
            <span className="absolute bottom-5 right-5 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-navy">Vol. 3 · 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
