import type { TeamStatus } from "@/lib/types";

const MAP: Record<TeamStatus, { t: string; c: string }> = {
  pending: { t: "Menunggu", c: "bg-amber-100 text-amber-800" },
  approved: { t: "Disetujui", c: "bg-emerald-100 text-emerald-800" },
  rejected: { t: "Ditolak", c: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: TeamStatus }) {
  const s = MAP[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s.c}`}>{s.t}</span>;
}
