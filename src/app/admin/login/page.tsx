import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Login Admin", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="bg-hero grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <Image src="/img/logo-heavan-white.png" alt="Heavan With You" width={130} height={50} className="h-10 w-auto" />
          <span className="h-6 w-px bg-white/30" />
          <span className="display text-2xl">Admin HEABIT</span>
        </div>
        <div className="card p-7 sm:p-8">
          <h1 className="text-xl font-extrabold text-brand-navy">Masuk panitia</h1>
          <p className="mt-1 text-sm text-slate-500">Gunakan akun admin yang dibuat di Supabase.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
