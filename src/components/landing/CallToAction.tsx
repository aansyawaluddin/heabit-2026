import Image from "next/image";
import Link from "next/link";
import type { PublicStats } from "@/lib/types";

export function CallToAction({ stats }: { stats: PublicStats }) {
  const left = Math.max(0, stats.quota - stats.registered);
  const pct = Math.min(100, Math.round((stats.registered / stats.quota) * 100));
  const open = stats.registration_open && left > 0;
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-hero relative overflow-hidden rounded-[2rem] px-6 py-12 text-white sm:px-12 lg:py-16">
          <Image src="/img/runner-1.webp" alt="" width={623} height={1300} className="absolute -bottom-4 right-4 hidden h-80 w-auto lg:block" />
          <div className="relative max-w-2xl">
            <h2 className="display text-4xl leading-none sm:text-6xl">Siap baku bitte?</h2>
            <p className="mt-4 text-lg text-white/90">
              Daftarkan komunitasmu: 5 pelari utama, 2 cadangan, foto tiap peserta, dan jumlah tim cheering. Proses kurang dari 5 menit.
            </p>
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-sm font-semibold">
                <span>{stats.registered} komunitas terdaftar</span>
                <span className="text-brand-ice">sisa {left} slot</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="mt-8">
              {open ? (
                <Link href="/daftar" className="btn-primary px-8 py-4 text-base">
                  Daftarkan Komunitas →
                </Link>
              ) : (
                <span className="btn-primary pointer-events-none px-8 py-4 text-base opacity-70">{left === 0 ? "Kuota Penuh" : "Pendaftaran Ditutup"}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
