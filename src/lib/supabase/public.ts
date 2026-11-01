import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import type { BracketRow, PublicStats } from "@/lib/types";

/** Klien anonim tanpa cookie, untuk data publik di landing page. */
function anon() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const DEFAULT_STATS: PublicStats = { quota: 15, registration_open: true, registered: 0, approved: 0 };

export async function getPublicStats(): Promise<PublicStats> {
  if (!hasSupabaseEnv) return DEFAULT_STATS;
  const { data, error } = await anon().rpc("public_stats");
  if (error || !data) return DEFAULT_STATS;
  return data as PublicStats;
}

export async function getPublicBracket(): Promise<BracketRow[]> {
  if (!hasSupabaseEnv) return [];
  const { data, error } = await anon().rpc("public_bracket");
  if (error || !data) return [];
  return data as BracketRow[];
}
