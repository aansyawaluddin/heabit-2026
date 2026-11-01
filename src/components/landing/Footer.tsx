import Image from "next/image";
import { EVENT, waLink } from "@/lib/event";

export function Footer() {
  return (
    <footer className="bg-brand-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-4">
            <Image src="/img/logo-heavan-white.png" alt="Heavan With You" width={140} height={54} className="h-11 w-auto" />
            <span className="rounded-xl bg-white px-2.5 py-1.5">
              <Image src="/img/logo-run.png" alt="Heavan Run" width={140} height={56} className="h-9 w-auto" />
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            {EVENT.longName} · {EVENT.edition}. Diselenggarakan oleh Panitia Heavan Run bersama Cafe Heavan With You.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-ice">Kontak Panitia</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {EVENT.contacts.map((c) => (
              <li key={c.phone}>
                <a href={waLink(c.phone, "Halo panitia HEABIT 2026, saya ingin bertanya.")} target="_blank" rel="noreferrer" className="font-semibold hover:text-brand-ice">
                  {c.name} · {c.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`https://instagram.com/${EVENT.instagram}`} target="_blank" rel="noreferrer" className="font-semibold hover:text-brand-ice">
                Instagram @{EVENT.instagram}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-ice">Lokasi</h3>
          <p className="mt-4 text-sm font-semibold">{EVENT.venue}</p>
          <p className="text-sm text-white/70">{EVENT.address}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© 2026 HEABIT · Heavan Bitte. #AlwaysWithYou</div>
    </footer>
  );
}
