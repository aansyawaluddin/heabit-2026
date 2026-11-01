"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { renameParticipant } from "@/app/admin/actions";
import { rosterLabel } from "@/lib/event";
import type { Participant } from "@/lib/types";

export function ParticipantGrid({ participants }: { participants: Participant[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-extrabold text-brand-navy">Peserta ({participants.length})</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {participants.map((p) => (
          <ParticipantCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

function ParticipantCard({ p }: { p: Participant }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(p.full_name);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const reserve = p.role === "cadangan";

  return (
    <div className="card overflow-hidden">
      <a href={p.photo_url ?? "#"} target="_blank" rel="noreferrer" className="relative block aspect-[3/4] bg-slate-100">
        {p.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_url} alt={`Foto ${p.full_name}`} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-slate-400">Foto tidak tersedia</span>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
            reserve ? "bg-slate-700" : p.gender === "L" ? "bg-brand" : "bg-pink-500"
          }`}
        >
          {rosterLabel(p)}
        </span>
      </a>
      <div className="p-3">
        {edit ? (
          <div className="space-y-2">
            <input className="input px-2 py-1.5 text-sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await renameParticipant(p.id, name);
                    if (r.ok) {
                      setEdit(false);
                      setErr(null);
                    } else setErr(r.error);
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-brand disabled:opacity-60"
              >
                {pending && <Spinner className="h-3 w-3" />}
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                onClick={() => {
                  setEdit(false);
                  setName(p.full_name);
                }}
                className="text-xs font-bold text-slate-500"
              >
                Batal
              </button>
            </div>
            {err && <p className="text-[11px] text-red-600">{err}</p>}
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-tight text-brand-navy">{p.full_name}</p>
            <button onClick={() => setEdit(true)} className="shrink-0 text-[11px] font-bold text-slate-400 hover:text-brand" aria-label={`Ubah nama ${p.full_name}`}>
              Ubah
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
