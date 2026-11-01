import { DrawBoard } from "@/components/admin/DrawBoard";
import { requireAdmin } from "@/lib/admin";
import type { DrawEntry } from "@/lib/types";

export default async function UndianPage() {
  const { supabase } = await requireAdmin();
  const [{ data: teams }, { data: entries, error }] = await Promise.all([
    supabase.from("teams").select("id, community_name").eq("status", "approved").order("community_name"),
    supabase.from("draw_entries").select("*, team:teams(community_name)").order("position"),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="display text-4xl text-brand-navy">Undian &amp; Bagan</h1>
        <p className="text-sm text-slate-500">
          Spin wheel untuk mengundi tim ke setiap match. Hasil langsung tampil di bagan pada landing page.
        </p>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Gagal memuat bagan: {error.message}</p>}
      <DrawBoard approvedTeams={teams ?? []} entries={(entries ?? []) as DrawEntry[]} />
    </div>
  );
}
