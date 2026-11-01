import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Memastikan pengguna login & terdaftar sebagai admin. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: Boolean(isAdmin) };
}
