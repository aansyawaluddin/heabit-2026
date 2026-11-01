import Image from "next/image";
import { EVENT } from "@/lib/event";
import { SectionTitle } from "./SectionTitle";

export function Categories() {
  return (
    <section id="kategori" className="bg-hero relative scroll-mt-20 overflow-hidden py-20 text-white lg:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          light
          kicker="Kategori Lomba"
          title="Dua lomba, satu komunitas."
          desc="Setiap komunitas mengirim satu tim relay dan boleh ikut serta dalam lomba cheering."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* RELAY */}
          <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-ink via-brand-navy to-brand-deep p-7 shadow-2xl sm:p-9">
            <Image src="/img/runner-1.webp" alt="" width={623} height={1300} className="absolute right-4 bottom-0 h-56 w-auto opacity-90 sm:right-10 sm:h-96 sm:opacity-95" />
            <div className="relative max-w-[68%] sm:max-w-[58%]">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-[0.18em]">KATEGORI 01</span>
              <h3 className="display mt-4 text-5xl leading-none sm:text-6xl">RELAY</h3>
              <p className="mt-2 text-xl font-bold text-brand-ice">1 putaran ({EVENT.routeKm}) / pelari</p>
              <ul className="mt-6 space-y-3 text-sm text-white/90 sm:text-base">
                <li className="flex gap-3"><Dot /><span>5 pelari utama: <b>3 putra + 2 putri</b></span></li>
                <li className="flex gap-3"><Dot /><span>2 cadangan: <b>1 putra + 1 putri</b></span></li>
                <li className="flex gap-3"><Dot /><span>Lintasan loop di sekitar Heavan 2.0, start &amp; finish tepat di depan Heavan Experience</span></li>
                <li className="flex gap-3"><Dot /><span>Kualifikasi → Semifinal → Final</span></li>
              </ul>
            </div>
          </article>

          {/* CHEERING */}
          <article className="relative overflow-hidden rounded-[2rem] bg-white p-7 text-brand-navy shadow-2xl sm:p-9">
            <span className="rounded-full bg-brand-sky px-3 py-1 text-xs font-bold tracking-[0.18em] text-brand-deep">KATEGORI 02</span>
            <h3 className="display mt-4 text-5xl leading-none text-brand sm:text-6xl">CHEERING</h3>
            <p className="mt-2 text-xl font-bold">Supporter paling heboh, paling kompak.</p>
            <p className="mt-4 text-slate-600">
              Bawa yel-yel, atribut, dan energi terbaik komunitasmu di sepanjang lintasan. Komunitas mendaftarkan jumlah anggota
              cheering saat registrasi. Juara dinilai dari kekompakan, kreativitas, dan semangat.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/img/cheer-1.webp" alt="Supporter komunitas bersorak" fill sizes="(min-width:1024px) 280px, 45vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/img/cheer-2.webp" alt="Supporter membawa papan dukungan" fill sizes="(min-width:1024px) 280px, 45vw" className="object-cover" />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-brand-ice" />;
}
