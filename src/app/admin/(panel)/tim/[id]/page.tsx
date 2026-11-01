import Link from "next/link";
import { notFound } from "next/navigation";
import { ParticipantGrid } from "@/components/admin/ParticipantGrid";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TeamActions } from "@/components/admin/TeamActions";
import { requireAdmin } from "@/lib/admin";
import { ROSTER, waLink } from "@/lib/event";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import type { Participant, Team } from "@/lib/types";

export default async function TeamDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).maybeSingle<Team>();
  if (!team) notFound();

  const { data: parts } = await supabase.from("participants").select("*").eq("team_id", id);
  const list = (parts ?? []) as Participant[];
  const signed = list.length
    ? (await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(list.map((p) => p.photo_path), 60 * 60)).data ?? []
    : [];
  const urlByPath = new Map(signed.map((s) => [s.path, s.signedUrl]));
  const order = (p: Participant) => ROSTER.findIndex((r) => r.gender === p.gender && r.role === p.role && r.slot === p.slot);
  const participants = list.map((p) => ({ ...p, photo_url: urlByPath.get(p.photo_path) ?? null })).sort((a, b) => order(a) - order(b));

  const { data: draws } = await supabase.from("draw_entries").select("stage, group_code, rank").eq("team_id", id);

  return (
    <div className="grid gap-6">
      <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-brand-navy">
        ← Semua peserta
      </Link>

      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="display text-4xl text-brand-navy">{team.community_name}</h1>
              <StatusBadge status={team.status} />
            </div>
            <dl className="mt-4 grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Penanggung jawab</dt>
                <dd className="font-semibold">{team.pic_name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">WhatsApp</dt>
                <dd>
                  <a
                    href={waLink(team.pic_phone, `Halo ${team.pic_name}, kami panitia HEABIT 2026 terkait pendaftaran ${team.community_name}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    +{team.pic_phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Lomba cheering</dt>
                <dd className="font-semibold">{team.join_cheering ? `Ikut · ${team.cheering_count} orang` : "Tidak ikut"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mendaftar</dt>
                <dd className="font-semibold">
                  {new Date(team.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" })} WITA
                </dd>
              </div>
              {draws && draws.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Bagan</dt>
                  <dd className="font-semibold">
                    {draws.map((d) => `${d.stage} ${d.group_code}${d.rank ? ` (peringkat ${d.rank})` : ""}`).join(" · ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <TeamActions teamId={team.id} status={team.status} note={team.admin_note ?? ""} name={team.community_name} />
        </div>
      </div>

      <ParticipantGrid participants={participants} />
    </div>
  );
}
