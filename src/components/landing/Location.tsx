import Image from "next/image";
import { EVENT } from "@/lib/event";
import { SectionTitle } from "./SectionTitle";

export function Location() {
  return (
    <section id="lokasi" className="scroll-mt-20 overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <SectionTitle
            kicker="Waktu, Tempat & Rute"
            title={
              <>
                Start &amp; finish di <span className="text-brand">Heavan Experience.</span>
              </>
            }
            desc="Lintasan loop ±0,96 km mengelilingi blok Heavan 2.0 di Kawasan CPI. Setiap pelari menempuh 1 putaran, lalu menyerahkan estafet ke rekan setim."
          />

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info label="Tanggal" value={EVENT.dateLabel} />
            <Info label="Waktu" value={EVENT.time} />
            <Info label="Lokasi" value={EVENT.venue} />
            <Info label="Alamat" value={EVENT.address} />
          </dl>

          <div className="mt-6 rounded-2xl bg-brand-sky p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">Rundown singkat</p>
            <ul className="mt-3 space-y-2">
              {EVENT.schedule.map((s) => (
                <li key={s.time} className="flex gap-4">
                  <span className="w-28 shrink-0 font-extrabold text-brand-navy">{s.time}</span>
                  <span className="text-slate-700">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <a href={EVENT.mapsUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6">
            Buka di Google Maps ↗
          </a>
        </div>

        <figure className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-brand/15" />
          <Image
            src="/img/denah.webp"
            alt="Denah rute lomba relay mengelilingi blok Heavan 2.0 dengan titik start/finish di depan Heavan Experience"
            width={998}
            height={1565}
            className="relative w-full rounded-[1.75rem] shadow-2xl"
          />
          <figcaption className="mt-3 text-center text-xs text-slate-500">Denah rute & titik start/finish · sumber citra: Google Maps</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold text-brand-navy">{value}</dd>
    </div>
  );
}
