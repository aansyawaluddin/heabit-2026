"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface WheelItem {
  id: string;
  label: string;
}

export interface WheelHandle {
  spin: () => void;
}

const COLORS = [
  { bg: "#3385ce", fg: "#ffffff" },
  { bg: "#0d203b", fg: "#ffffff" },
  { bg: "#7fd0ff", fg: "#0d203b" },
  { bg: "#2468a8", fg: "#ffffff" },
];
const SPIN_MS = 5200;
const SIZE = 440;
const R = SIZE / 2 - 10;
const C = SIZE / 2;

function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return [Math.round((C + r * Math.sin(a)) * 100) / 100, Math.round((C - r * Math.cos(a)) * 100) / 100] as const;
}

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

/** Spin wheel SVG. Penunjuk ada di atas (jam 12). */
export const Wheel = forwardRef<WheelHandle, { items: WheelItem[]; disabled?: boolean; onResult: (item: WheelItem) => void; onSpinStart?: () => void }>(
  function Wheel({ items, disabled, onResult, onSpinStart }, ref) {
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const rotRef = useRef(0);
    const n = items.length;
    const seg = n > 0 ? 360 / n : 360;

    function spin() {
      if (spinning || disabled || n === 0) return;
      const index = randomInt(n);
      const jitter = (Math.random() - 0.5) * seg * 0.7;
      const target = (((-(index + 0.5) * seg + jitter) % 360) + 360) % 360;
      const current = ((rotRef.current % 360) + 360) % 360;
      const delta = ((target - current + 360) % 360) + 360 * 7;
      const next = rotRef.current + delta;
      rotRef.current = next;
      setSpinning(true);
      onSpinStart?.();
      setRotation(next);
      const picked = items[index];
      window.setTimeout(() => {
        setSpinning(false);
        onResult(picked);
      }, SPIN_MS + 150);
    }

    useImperativeHandle(ref, () => ({ spin }));

    const fontSize = n > 12 ? 13 : n > 8 ? 15 : 17;
    const maxChars = n > 12 ? 16 : 20;

    return (
      <div className="relative mx-auto aspect-square w-full max-w-[440px] select-none">
        {/* penunjuk */}
        <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2 drop-shadow-lg">
          <svg width="44" height="52" viewBox="0 0 44 52">
            <path d="M22 50 L4 10 A20 20 0 0 1 40 10 Z" fill="#ef4444" stroke="#fff" strokeWidth="3" />
            <circle cx="22" cy="16" r="6" fill="#fff" />
          </svg>
        </div>

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full drop-shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.12, 1)` : "none",
          }}
          role="img"
          aria-label={`Roda undian berisi ${n} tim`}
        >
          <circle cx={C} cy={C} r={R + 8} fill="#0d203b" />
          {n === 0 && <circle cx={C} cy={C} r={R} fill="#e2e8f0" />}
          {n === 1 && <circle cx={C} cy={C} r={R} fill={COLORS[0].bg} />}
          {n > 1 &&
            items.map((it, i) => {
              const [x1, y1] = point(i * seg, R);
              const [x2, y2] = point((i + 1) * seg, R);
              const large = seg > 180 ? 1 : 0;
              const col = COLORS[(n % 4 === 1 && i === n - 1 ? 1 : i) % COLORS.length];
              return <path key={it.id} d={`M${C},${C} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`} fill={col.bg} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />;
            })}
          {items.map((it, i) => {
            const mid = n === 1 ? 0 : (i + 0.5) * seg;
            const col = COLORS[(n % 4 === 1 && i === n - 1 ? 1 : i) % COLORS.length];
            const label = it.label.length > maxChars ? it.label.slice(0, maxChars - 1) + "…" : it.label;
            return (
              <g key={`t-${it.id}`} transform={`rotate(${mid - 90} ${C} ${C})`}>
                <text x={C + R - 18} y={C} textAnchor="end" dominantBaseline="middle" fontSize={fontSize} fontWeight={700} fill={n === 1 ? "#fff" : col.fg} fontFamily="Poppins, sans-serif">
                  {label}
                </text>
              </g>
            );
          })}
          {Array.from({ length: Math.max(n, 12) }).map((_, i) => {
            const [x, y] = point((i * 360) / Math.max(n, 12), R + 4);
            return <circle key={`d-${i}`} cx={x} cy={y} r={2.6} fill="#7fd0ff" />;
          })}
        </svg>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || disabled || n === 0}
          className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-navy shadow-xl ring-8 ring-brand-navy transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-90"
        >
          <span className="display text-xl">{spinning ? "…" : "PUTAR"}</span>
        </button>
      </div>
    );
  },
);
