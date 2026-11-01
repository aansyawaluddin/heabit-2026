import Image from "next/image";
import { SectionTitle } from "./SectionTitle";

const GOALS = [
  { n: "01", t: "Meningkatkan semangat hidup sehat dan gaya hidup aktif." },
  { n: "02", t: "Menjadi wadah positif bagi komunitas lari dan masyarakat umum." },
  { n: "03", t: "Memperkenalkan identitas dan semangat positif Cafe Heavan." },
];

export function About() {
  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionTitle
            kicker="Latar Belakang"
            title={
              <>
                Lari, kompak, <span className="text-brand">baku bitte.</span>
              </>
            }
          />
          <div className="mt-6 space-y-4 text-slate-600">
            <p>
              Olahraga lari kini menjadi bagian dari gaya hidup sehat sekaligus wadah kebersamaan antar komunitas. Dari
              antusiasme itu, <b className="text-brand-navy">HEABIT (Heavan Bitte) 2026</b> hadir sebagai ajang yang menumbuhkan
              sportivitas dan mempererat hubungan antar komunitas pelari di Makassar.
            </p>
            <p>
              Tahun ini HEABIT hadir dengan dua lomba: <b className="text-brand-navy">Relay Race</b> untuk adu cepat dan kekompakan
              tim, serta <b className="text-brand-navy">Cheering Competition</b> untuk komunitas dengan dukungan paling heboh.
              Semuanya berlangsung di <b className="text-brand-navy">Heavan 2.0 / Heavan Experience</b>, Kawasan Center Point of
              Indonesia.
            </p>
          </div>

          <ol className="mt-8 grid gap-3">
            {GOALS.map((g) => (
              <li key={g.n} className="flex items-center gap-4 rounded-2xl bg-brand-sky p-4">
                <span className="display grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-navy text-lg text-white">{g.n}</span>
                <span className="font-semibold text-brand-navy">{g.t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4">
          <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl">
            <Image src="/img/g-group.webp" alt="Foto bersama komunitas lari di Heavan Run" fill sizes="(min-width:1024px) 600px, 95vw" className="object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl">
            <Image src="/img/g-heavan.webp" alt="Suasana di depan Cafe Heavan" fill sizes="(min-width:1024px) 300px, 48vw" className="object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl">
            <Image src="/img/g-finish.webp" alt="Pelari memasuki garis finish" fill sizes="(min-width:1024px) 300px, 48vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
