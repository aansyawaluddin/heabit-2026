"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { waLink } from "@/lib/event";
import type { Team, TeamStatus } from "@/lib/types";
import { ExportButton } from "./ExportButton";
import { StatusBadge } from "./StatusBadge";

export interface TeamRow extends Team {
  participant_count: number;
}

const FILTERS: { v: "all" | TeamStatus; t: string }[] = [
  { v: "all", t: "Semua" },
  { v: "pending", t: "Menunggu" },
  { v: "approved", t: "Disetujui" },
  { v: "rejected", t: "Ditolak" },
];

export function TeamsTable({ teams }: { teams: TeamRow[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<"all" | TeamStatus>("all");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return teams.filter(
      (t) =>
        (f === "all" || t.status === f) &&
        (!s || t.community_name.toLowerCase().includes(s) || t.pic_name.toLowerCase().includes(s) || t.pic_phone.includes(s)),
    );
  }, [teams, q, f]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
        <input className="input lg:max-w-xs" placeholder="Cari komunitas, PIC, atau nomor…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((x) => {
            const n = x.v === "all" ? teams.length : teams.filter((t) => t.status === x.v).length;
            return (
              <button
                key={x.v}
                onClick={() => setF(x.v)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${f === x.v ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {x.t} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        <ExportButton />
      </div>

      {rows.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500">{teams.length === 0 ? "Belum ada komunitas yang mendaftar." : "Tidak ada data yang cocok."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Komunitas</th>
                <th className="px-4 py-3">Penanggung jawab</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Cheering</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Daftar</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((t, i) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/tim/${t.id}`} className="font-bold text-brand-navy hover:text-brand">
                      {t.community_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{t.pic_name}</div>
                    <a href={waLink(t.pic_phone)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline">
                      +{t.pic_phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">{t.participant_count} orang</td>
                  <td className="px-4 py-3">
                    {t.join_cheering ? <span className="font-semibold text-brand-deep">Ya · {t.cheering_count} org</span> : <span className="text-slate-400">Tidak</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(t.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/tim/${t.id}`} className="btn-ghost px-4 py-1.5 text-xs">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
