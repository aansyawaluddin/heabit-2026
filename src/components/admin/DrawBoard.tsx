"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { drawAssign, removeEntry, resetStage, setFinalists, setRank } from "@/app/admin/actions";
import { Spinner } from "@/components/Spinner";
import { GROUP_LABEL, STAGES } from "@/lib/event";
import type { DrawEntry, GroupCode, Stage } from "@/lib/types";
import { Wheel, type WheelHandle, type WheelItem } from "./Wheel";

export interface DrawTeam {
  id: string;
  community_name: string;
}

interface Props {
  approvedTeams: DrawTeam[];
  entries: DrawEntry[];
}

const STAGE_HELP: Record<Stage, string> = {
  kualifikasi: "Putar roda untuk memasukkan tim yang sudah disetujui ke Match 1–3 (maks. 5 tim per match, diisi bergiliran). Setelah race, isi peringkat 1–5. Peringkat 1–3 lolos.",
  semifinal: "Roda berisi tim peringkat 1–3 dari kualifikasi. Hasil putaran mengisi Semifinal 1–3 (3 tim per match). Setelah race, isi peringkat; juara 1 tiap match ke final.",
  final: "Tetapkan finalis dari juara 1 tiap semifinal, lalu isi peringkat akhir untuk Juara 1, 2, dan 3.",
};

export function DrawBoard({ approvedTeams, entries }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("kualifikasi");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; group: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const wheelRef = useRef<WheelHandle>(null);

  const cfg = STAGES.find((s) => s.id === stage)!;
  const nameById = useMemo(() => new Map(approvedTeams.map((t) => [t.id, t.community_name])), [approvedTeams]);
  const teamName = (e: DrawEntry) => e.team?.community_name ?? nameById.get(e.team_id) ?? "—";

  const byStage = (s: Stage) => entries.filter((e) => e.stage === s);
  const stageEntries = byStage(stage);

  const pool: WheelItem[] = useMemo(() => {
    if (stage === "kualifikasi") {
      const drawn = new Set(byStage("kualifikasi").map((e) => e.team_id));
      return approvedTeams.filter((t) => !drawn.has(t.id)).map((t) => ({ id: t.id, label: t.community_name }));
    }
    if (stage === "semifinal") {
      const drawn = new Set(byStage("semifinal").map((e) => e.team_id));
      return byStage("kualifikasi")
        .filter((e) => e.rank !== null && e.rank <= 3 && !drawn.has(e.team_id))
        .map((e) => ({ id: e.team_id, label: teamName(e) }));
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, entries, approvedTeams]);

  const capacityLeft = cfg.groups.length * cfg.capacity - stageEntries.length;

  function act<T>(fn: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>, after?: (d: T) => void) {
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error);
      else after?.(r.data);
      router.refresh();
    });
  }

  function onResult(item: WheelItem) {
    setSpinning(false);
    act(
      () => drawAssign(stage, item.id),
      (d) => setResult({ name: item.label, group: GROUP_LABEL[d.group_code as GroupCode] }),
    );
  }

  const semiWinners = byStage("semifinal").filter((e) => e.rank === 1);

  return (
    <div className="grid gap-6" aria-busy={pending}>
      {pending && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-2xl">
          <Spinner /> Menyimpan…
        </div>
      )}
      {/* tab tahap */}
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setStage(s.id);
              setError(null);
              setConfirmReset(false);
            }}
            disabled={spinning}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
              stage === s.id ? "bg-brand-navy text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand"
            }`}
          >
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${stage === s.id ? "bg-brand" : "bg-slate-100"}`}>{i + 1}</span>
            {s.label}
            <span className="text-xs opacity-60">{byStage(s.id).length}</span>
          </button>
        ))}
      </div>

      <p className="rounded-xl bg-brand-sky px-4 py-3 text-sm text-brand-navy">{STAGE_HELP[stage]}</p>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_1fr]">
        {/* kiri: roda atau final */}
        <div className="card p-6">
          {stage !== "final" ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-brand-navy">Roda undian</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {pool.length} tim · {capacityLeft} slot kosong
                </span>
              </div>
              <Wheel ref={wheelRef} items={pool} disabled={pending || capacityLeft <= 0} onResult={onResult} onSpinStart={() => setSpinning(true)} />
              {pool.length === 0 && (
                <p className="mt-4 text-center text-sm text-slate-500">
                  {stage === "kualifikasi"
                    ? stageEntries.length
                      ? "Semua tim yang disetujui sudah masuk bagan."
                      : "Belum ada tim berstatus disetujui. Setujui tim di menu Peserta."
                    : byStage("kualifikasi").some((e) => e.rank)
                      ? "Semua tim yang lolos sudah diundi."
                      : "Isi peringkat match kualifikasi terlebih dahulu."}
                </p>
              )}
              {pool.length > 0 && capacityLeft <= 0 && <p className="mt-4 text-center text-sm text-amber-600">Semua slot pada tahap ini sudah penuh.</p>}
              <button
                onClick={() => wheelRef.current?.spin()}
                disabled={spinning || pending || pool.length === 0 || capacityLeft <= 0}
                className="btn-primary mt-6 w-full py-4 text-base"
              >
                {(spinning || pending) && <Spinner />}
                {spinning ? "Memutar…" : pending ? "Menyimpan…" : "🎯 Putar Roda"}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-extrabold text-brand-navy">Finalis</h2>
              <p className="mt-1 text-sm text-slate-500">Juara 1 dari tiap semifinal ({semiWinners.length}/3 sudah ditentukan).</p>
              <ul className="mt-4 space-y-2">
                {(["S1", "S2", "S3"] as const).map((g) => {
                  const w = semiWinners.find((e) => e.group_code === g);
                  return (
                    <li key={g} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-semibold text-slate-500">{GROUP_LABEL[g]}</span>
                      <span className="font-bold text-brand-navy">{w ? teamName(w) : "—"}</span>
                    </li>
                  );
                })}
              </ul>
              <button disabled={pending || semiWinners.length === 0} onClick={() => act(() => setFinalists())} className="btn-primary mt-6 w-full py-3.5">
                {pending && <Spinner />}
                {pending ? "Menyimpan…" : "Tetapkan Finalis"}
              </button>
              <p className="mt-2 text-xs text-slate-500">Menetapkan ulang akan mengganti isi bagan final.</p>
            </>
          )}
        </div>

        {/* kanan: grup */}
        <div className="grid content-start gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-brand-navy">Bagan {cfg.label}</h2>
            {stageEntries.length > 0 &&
              (!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="text-xs font-bold text-red-600 hover:underline">
                  Reset tahap ini
                </button>
              ) : (
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-red-700">Hapus semua hasil {cfg.label.toLowerCase()} & tahap sesudahnya?</span>
                  <button
                    onClick={() =>
                      act(
                        () => resetStage(stage),
                        () => setConfirmReset(false),
                      )
                    }
                    className="btn-danger px-3 py-1.5 text-xs"
                  >
                    {pending && <Spinner />}
                    {pending ? "Mereset…" : "Ya, reset"}
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="btn-ghost px-3 py-1.5 text-xs">
                    Batal
                  </button>
                </span>
              ))}
          </div>

          <div className="grid gap-4">
            {cfg.groups.map((g) => {
              const list = stageEntries.filter((e) => e.group_code === g).sort((a, b) => a.position - b.position);
              return (
                <div key={g} className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-ink via-brand-navy to-brand-deep p-4 text-white shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="display text-2xl">{GROUP_LABEL[g]}</h3>
                    <span className="text-xs font-bold text-white/60">
                      {list.length}/{cfg.capacity}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {Array.from({ length: cfg.capacity }).map((_, i) => {
                      const e = list[i];
                      if (!e)
                        return (
                          <li key={i} className="rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-white/40">
                            Slot {i + 1}
                          </li>
                        );
                      const advance = stage === "kualifikasi" ? e.rank !== null && e.rank <= 3 : e.rank === 1;
                      return (
                        <li key={e.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${advance ? "bg-emerald-400/20 ring-1 ring-emerald-300/40" : "bg-white/10"}`}>
                          <span className="w-4 text-xs text-white/50">{i + 1}</span>
                          <span className="flex-1 truncate font-semibold">{teamName(e)}</span>
                          <select
                            aria-label={`Peringkat ${teamName(e)}`}
                            value={e.rank ?? ""}
                            disabled={pending}
                            onChange={(ev) => act(() => setRank(e.id, ev.target.value ? Number(ev.target.value) : null))}
                            className="rounded-md border-0 bg-white/90 px-1.5 py-1 text-xs font-bold text-brand-navy"
                          >
                            <option value="">— peringkat —</option>
                            {Array.from({ length: cfg.capacity }).map((_, r) => (
                              <option key={r} value={r + 1}>
                                {stage === "final" ? `Juara ${r + 1}` : `#${r + 1}`}
                              </option>
                            ))}
                          </select>
                          {stage !== "final" && (
                            <button
                              onClick={() => act(() => removeEntry(e.id))}
                              disabled={pending}
                              className="grid h-6 w-6 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                              aria-label={`Keluarkan ${teamName(e)} dari bagan`}
                              title="Keluarkan dari bagan"
                            >
                              ×
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* modal hasil */}
      {result && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setResult(null)}>
          <div className="bg-hero w-full max-w-md rounded-3xl p-8 text-center text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-bold tracking-[0.2em] text-brand-ice">HASIL UNDIAN</p>
            <p className="display mt-3 text-4xl leading-tight">{result.name}</p>
            <p className="mt-4 text-white/80">masuk ke</p>
            <p className="display mt-1 text-5xl text-brand-navy">{result.group}</p>
            <button onClick={() => setResult(null)} className="btn-light mt-8 w-full">
              Lanjut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
