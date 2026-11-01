import { NextResponse } from "next/server";
import { ROSTER, rosterLabel } from "@/lib/event";
import { createClient } from "@/lib/supabase/server";
import type { Participant, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

function csv(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!user || !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("teams")
    .select("*, participants(*)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = ["Komunitas", "Status", "Penanggung Jawab", "WhatsApp", "Ikut Cheering", "Jumlah Cheering", "Posisi", "Nama Peserta", "Jenis Kelamin", "Peran"];
  const lines = [header.join(",")];
  for (const t of (data ?? []) as (Team & { participants: Participant[] })[]) {
    const idx = (p: Participant) => ROSTER.findIndex((r) => r.gender === p.gender && r.role === p.role && r.slot === p.slot);
    const parts = [...t.participants].sort((a, b) => idx(a) - idx(b));
    for (const p of parts) {
      lines.push(
        [
          t.community_name,
          STATUS[t.status],
          t.pic_name,
          `+${t.pic_phone}`,
          t.join_cheering ? "Ya" : "Tidak",
          t.cheering_count ?? "",
          rosterLabel(p),
          p.full_name,
          p.gender === "L" ? "Putra" : "Putri",
          p.role === "utama" ? "Utama" : "Cadangan",
        ]
          .map(csv)
          .join(","),
      );
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="peserta-heabit-2026-${stamp}.csv"`,
    },
  });
}
