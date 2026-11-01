import { SettingsCard } from "@/components/admin/SettingsCard";
import { StatCards } from "@/components/admin/StatCards";
import { TeamsTable, type TeamRow } from "@/components/admin/TeamsTable";
import { requireAdmin } from "@/lib/admin";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [{ data: teams, error }, { data: settings }] = await Promise.all([
    supabase.from("teams").select("*, participants(count)").order("created_at", { ascending: true }),
    supabase.from("event_settings").select("quota, registration_open").eq("id", 1).single(),
  ]);

  const rows: TeamRow[] = (teams ?? []).map((t) => ({
    ...t,
    participant_count: (t.participants as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="display text-4xl text-brand-navy">Manajemen Peserta</h1>
        <p className="text-sm text-slate-500">Verifikasi pendaftaran komunitas, cek foto peserta, dan atur kuota.</p>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Gagal memuat data: {error.message}</p>}
      <StatCards teams={rows} quota={settings?.quota ?? 15} />
      <SettingsCard quota={settings?.quota ?? 15} open={settings?.registration_open ?? true} />
      <TeamsTable teams={rows} />
    </div>
  );
}
