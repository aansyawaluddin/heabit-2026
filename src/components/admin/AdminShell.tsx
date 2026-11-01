import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "./AdminNav";

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-brand-navy text-white shadow">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/img/logo-heavan-white.png" alt="" width={100} height={38} className="h-7 w-auto" />
            <span className="display hidden text-lg sm:block">Admin HEABIT</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden text-sm font-semibold text-white/75 hover:text-white md:block">
              Lihat situs ↗
            </Link>
            <span className="hidden max-w-[180px] truncate text-xs text-white/60 lg:block">{email}</span>
            <form action={signOut}>
              <button className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20">Keluar</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
