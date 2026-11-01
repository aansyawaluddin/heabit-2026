import type { TeamRow } from "./TeamsTable";

export function StatCards({ teams, quota }: { teams: TeamRow[]; quota: number }) {
  const active = teams.filter((t) => t.status !== "rejected");
  const approved = teams.filter((t) => t.status === "approved");
  const pending = teams.filter((t) => t.status === "pending");
  const cheer = active.filter((t) => t.join_cheering);
  const cheerPeople = cheer.reduce((s, t) => s + (t.cheering_count ?? 0), 0);
  const runners = active.reduce((s, t) => s + t.participant_count, 0);

  const cards = [
    { label: "Komunitas terdaftar", value: `${active.length}/${quota}`, hint: `${Math.max(0, quota - active.length)} slot tersisa` },
    { label: "Disetujui", value: approved.length, hint: `${pending.length} menunggu verifikasi` },
    { label: "Total pelari", value: runners, hint: "termasuk cadangan" },
    { label: "Ikut cheering", value: cheer.length, hint: `${cheerPeople} orang supporter` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{c.label}</p>
          <p className="display mt-2 text-4xl text-brand-navy">{c.value}</p>
          <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}
