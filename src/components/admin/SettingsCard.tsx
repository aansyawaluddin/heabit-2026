"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { updateSettings } from "@/app/admin/actions";

export function SettingsCard({ quota, open }: { quota: number; open: boolean }) {
  const [q, setQ] = useState(String(quota));
  const [isOpen, setIsOpen] = useState(open);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = Number(q) !== quota || isOpen !== open;

  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
      <div className="flex-1">
        <p className="text-sm font-extrabold text-brand-navy">Pengaturan pendaftaran</p>
        <p className="text-xs text-slate-500">Tutup pendaftaran atau ubah kuota komunitas kapan saja.</p>
      </div>
      <label className="flex items-center gap-3">
        <span className="text-sm font-semibold">Kuota</span>
        <input type="number" min={1} max={100} value={q} onChange={(e) => setQ(e.target.value)} className="input w-24 py-2" />
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <span className="text-sm font-semibold">Pendaftaran</span>
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition ${isOpen ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${isOpen ? "left-6" : "left-1"}`} />
        </button>
        <span className={`text-xs font-bold ${isOpen ? "text-emerald-600" : "text-slate-500"}`}>{isOpen ? "DIBUKA" : "DITUTUP"}</span>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() =>
            start(async () => {
              const r = await updateSettings(Number(q), isOpen);
              setMsg(r.ok ? { ok: true, text: "Tersimpan" } : { ok: false, text: r.error });
            })
          }
          className="btn-primary py-2.5"
        >
          {pending && <Spinner />}
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
        {msg && <span className={`text-xs font-bold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
