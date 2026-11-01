"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hasSupabaseEnv) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3.5">
        {loading && <Spinner />}
        {loading ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
