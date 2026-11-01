"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyError } from "@/lib/errors";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Stage, TeamStatus } from "@/lib/types";

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

async function admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("FORBIDDEN");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("FORBIDDEN");
  return supabase;
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: friendlyError(e instanceof Error ? e.message : String(e)) };
}

/* ---------------- peserta ---------------- */

export async function setTeamStatus(teamId: string, status: TeamStatus): Promise<Result> {
  try {
    const supabase = await admin();
    const { error } = await supabase.from("teams").update({ status }).eq("id", teamId);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

export async function saveTeamNote(teamId: string, note: string): Promise<Result> {
  try {
    const supabase = await admin();
    const { error } = await supabase.from("teams").update({ admin_note: note.trim() || null }).eq("id", teamId);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

export async function renameParticipant(participantId: string, name: string): Promise<Result> {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2) return { ok: false, error: "Nama minimal 2 karakter." };
  try {
    const supabase = await admin();
    const { error } = await supabase.from("participants").update({ full_name: clean }).eq("id", participantId);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTeam(teamId: string): Promise<Result> {
  try {
    const supabase = await admin();
    const { data: parts, error: pErr } = await supabase.from("participants").select("photo_path").eq("team_id", teamId);
    if (pErr) throw pErr;
    const paths = (parts ?? []).map((p) => p.photo_path).filter(Boolean);
    if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) throw error;
    refresh();
  } catch (e) {
    return fail(e);
  }
  redirect("/admin");
}

export async function updateSettings(quota: number, registrationOpen: boolean): Promise<Result> {
  if (!Number.isInteger(quota) || quota < 1 || quota > 100) return { ok: false, error: "Kuota harus 1–100." };
  try {
    const supabase = await admin();
    const { error } = await supabase
      .from("event_settings")
      .update({ quota, registration_open: registrationOpen, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- undian ---------------- */

export async function drawAssign(stage: Stage, teamId: string): Promise<Result<{ group_code: string; position: number }>> {
  try {
    const supabase = await admin();
    const { data, error } = await supabase.rpc("draw_assign", { p_stage: stage, p_team: teamId });
    if (error) throw new Error(error.message);
    refresh();
    return { ok: true, data: data as { group_code: string; position: number } };
  } catch (e) {
    return fail(e);
  }
}

export async function setRank(entryId: string, rank: number | null): Promise<Result> {
  try {
    const supabase = await admin();
    const { error } = await supabase.from("draw_entries").update({ rank }).eq("id", entryId);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

export async function removeEntry(entryId: string): Promise<Result> {
  try {
    const supabase = await admin();
    const { error } = await supabase.from("draw_entries").delete().eq("id", entryId);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

/** Reset tahap ini beserta tahap-tahap sesudahnya. */
export async function resetStage(stage: Stage): Promise<Result> {
  const order: Stage[] = ["kualifikasi", "semifinal", "final"];
  const stages = order.slice(order.indexOf(stage));
  try {
    const supabase = await admin();
    const { error } = await supabase.from("draw_entries").delete().in("stage", stages);
    if (error) throw error;
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return fail(e);
  }
}

export async function setFinalists(): Promise<Result<number>> {
  try {
    const supabase = await admin();
    const { data, error } = await supabase.rpc("set_finalists");
    if (error) throw new Error(error.message);
    refresh();
    return { ok: true, data: data as number };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- sesi ---------------- */

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
