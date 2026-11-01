import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/form/RegistrationForm";
import { EVENT, waLink } from "@/lib/event";
import { getPublicStats } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Pendaftaran Komunitas" };
export const dynamic = "force-dynamic";

export default async function DaftarPage() {
  const stats = await getPublicStats();
  const left = Math.max(0, stats.quota - stats.registered);
  const open = stats.registration_open && left > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-hero relative overflow-hidden text-white">
        <div className="bg-dots pointer-events-none absolute right-4 top-6 h-32 w-56 opacity-50 [mask-image:linear-gradient(135deg,transparent_15%,#000_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/img/logo-heavan-white.png" alt="Heavan With You" width={120} height={46} className="h-8 w-auto" />
              <span className="display hidden text-lg sm:block">HEABIT 2026</span>
            </Link>
            <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
              ← Beranda
            </Link>
          </div>
          <span className="kicker mt-10">Pendaftaran Komunitas</span>
          <h1 className="display mt-4 text-5xl leading-none sm:text-6xl">Daftarkan tim relay-mu.</h1>
          <p className="mt-4 max-w-2xl text-white/90">
            {EVENT.dateLabel} · {EVENT.venue}, CPI Makassar. Setiap komunitas mendaftarkan 5 pelari utama (3 putra, 2 putri) dan 2 cadangan
            (1 putra, 1 putri), lengkap dengan foto masing-masing.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-brand-navy/60 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
            <span className={`h-2.5 w-2.5 rounded-full ${open ? "bg-emerald-400" : "bg-red-400"}`} />
            {open ? `Sisa ${left} dari ${stats.quota} slot komunitas` : left === 0 ? "Kuota komunitas sudah penuh" : "Pendaftaran sedang ditutup"}
          </div>
        </div>
      </header>

      <main className="relative -mt-6 px-4 pb-20 sm:px-6">
        {open ? (
          <RegistrationForm />
        ) : (
          <div className="card mx-auto max-w-2xl p-10 text-center">
            <h2 className="display text-3xl text-brand-navy">{left === 0 ? "Kuota sudah penuh" : "Pendaftaran ditutup"}</h2>
            <p className="mt-3 text-slate-600">Hubungi panitia untuk informasi daftar tunggu atau pertanyaan lainnya.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {EVENT.contacts.map((c) => (
                <a key={c.phone} href={waLink(c.phone)} target="_blank" rel="noreferrer" className="btn-ghost">
                  WhatsApp {c.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
