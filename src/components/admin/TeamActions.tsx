"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { deleteTeam, saveTeamNote, setTeamStatus } from "@/app/admin/actions";
import type { TeamStatus } from "@/lib/types";

export function TeamActions({ teamId, status, note, name }: { teamId: string; status: TeamStatus; note: string; name: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState(note);
  const [confirm, setConfirm] = useState(false);
  const [which, setWhich] = useState<string | null>(null);

  const run = (key: string, fn: () => Promise<{ ok: boolean; error?: string } | void>) =>
    start(async () => {
      setWhich(key);
      setErr(null);
      const r = await fn();
      if (r && !r.ok) setErr(r.error ?? "Gagal");
    });
  const busy = (key: string) => pending && which === key;

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <button disabled={pending || status === "approved"} onClick={() => run("approved", () => setTeamStatus(teamId, "approved"))} className="btn bg-emerald-600 px-3 py-2.5 text-xs text-white hover:bg-emerald-700">
          {busy("approved") ? <Spinner /> : "✓"} Setujui
        </button>
        <button disabled={pending || status === "pending"} onClick={() => run("pending", () => setTeamStatus(teamId, "pending"))} className="btn-ghost px-3 py-2.5 text-xs">
          {busy("pending") && <Spinner />} Tunda
        </button>
        <button disabled={pending || status === "rejected"} onClick={() => run("rejected", () => setTeamStatus(teamId, "rejected"))} className="btn bg-amber-500 px-3 py-2.5 text-xs text-white hover:bg-amber-600">
          {busy("rejected") ? <Spinner /> : "✕"} Tolak
        </button>
      </div>

      <div>
        <label className="label text-xs" htmlFor="note">
          Catatan panitia (internal)
        </label>
        <textarea id="note" rows={2} className="input text-sm" value={n} onChange={(e) => setN(e.target.value)} placeholder="contoh: sudah konfirmasi via WA" />
        {n !== note && (
          <button disabled={pending} onClick={() => run("note", () => saveTeamNote(teamId, n))} className="btn-primary mt-2 px-4 py-2 text-xs">
            {busy("note") && <Spinner />} {busy("note") ? "Menyimpan…" : "Simpan catatan"}
          </button>
        )}
      </div>

      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="text-xs font-bold text-red-600 hover:underline">
          Hapus pendaftaran…
        </button>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          Hapus <b>{name}</b> beserta seluruh foto peserta? Tindakan ini permanen.
          <div className="mt-2 flex gap-2">
            <button disabled={pending} onClick={() => run("delete", () => deleteTeam(teamId))} className="btn-danger px-3 py-1.5 text-xs">
              {busy("delete") && <Spinner />}
              {busy("delete") ? "Menghapus…" : "Ya, hapus"}
            </button>
            <button onClick={() => setConfirm(false)} className="btn-ghost px-3 py-1.5 text-xs">
              Batal
            </button>
          </div>
        </div>
      )}
      {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
    </div>
  );
}
