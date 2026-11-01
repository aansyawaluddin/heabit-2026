import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl font-extrabold text-brand-navy">Akun bukan admin</h1>
          <p className="mt-2 text-sm text-slate-600">
            {user.email} belum terdaftar di tabel <code className="rounded bg-slate-100 px-1">admins</code>. Minta pengelola menambahkan akun ini.
          </p>
          <form action={signOut} className="mt-6">
            <button className="btn-primary">Keluar</button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
