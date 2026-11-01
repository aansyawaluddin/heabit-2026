"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    Hari: Math.floor(ms / 86_400_000),
    Jam: Math.floor((ms / 3_600_000) % 24),
    Menit: Math.floor((ms / 60_000) % 60),
    Detik: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ dateISO }: { dateISO: string }) {
  const target = new Date(dateISO).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex gap-2 sm:gap-3" aria-label="Hitung mundur menuju hari lomba">
      {Object.entries(left ?? { Hari: 0, Jam: 0, Menit: 0, Detik: 0 }).map(([k, v]) => (
        <div key={k} className="w-16 rounded-2xl bg-brand-navy/70 px-2 py-2.5 text-center ring-1 ring-white/15 backdrop-blur sm:w-20">
          <div className="display text-2xl tabular-nums text-white sm:text-3xl">{left ? String(v).padStart(2, "0") : "--"}</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ice">{k}</div>
        </div>
      ))}
    </div>
  );
}
