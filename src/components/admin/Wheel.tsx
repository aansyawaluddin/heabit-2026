"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

export interface WheelItem {
  id: string;
  label: string;
}

export interface WheelHandle {
  spin: () => void;
}

interface Props {
  items: WheelItem[];
  disabled?: boolean;
  muted?: boolean;
  /** Ukuran besar untuk mode live / layar proyektor. */
  big?: boolean;
  onResult: (item: WheelItem) => void;
  onSpinStart?: () => void;
}

const COLORS = [
  { bg: "#3385ce", fg: "#ffffff" },
  { bg: "#0d203b", fg: "#ffffff" },
  { bg: "#7fd0ff", fg: "#0d203b" },
  { bg: "#2468a8", fg: "#ffffff" },
];
const SPIN_MS = 6500;
/** Jeda setelah roda berhenti sebelum hasil diumumkan, supaya penonton sempat melihat pemenangnya. */
const REVEAL_DELAY_MS = 1100;
const SIZE = 500;
const C = SIZE / 2;
const R = C - 14;
/** Hub tengah = 22% lebar roda → jari-jari 55 unit. Teks dimulai sedikit di luar hub. */
const TEXT_IN = SIZE * 0.11 + 12;
const TEXT_OUT = R - 14;
const TEXT_LEN = TEXT_OUT - TEXT_IN;
const CHAR_W = 0.62;
const MIN_FS = 9;

function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return [Math.round((C + r * Math.sin(a)) * 100) / 100, Math.round((C - r * Math.cos(a)) * 100) / 100] as const;
}

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function colorFor(i: number, n: number) {
  // hindari dua irisan bersebelahan berwarna sama saat n % 4 === 1
  return COLORS[(n % 4 === 1 && i === n - 1 ? 1 : i) % COLORS.length];
}

function splitTwo(label: string): [string, string] | null {
  const words = label.split(/\s+/);
  if (words.length < 2) return null;
  let best: [string, string] | null = null;
  let bestLen = Infinity;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(" ");
    const b = words.slice(k).join(" ");
    const longest = Math.max(a.length, b.length);
    if (longest < bestLen) {
      bestLen = longest;
      best = [a, b];
    }
  }
  return best;
}

/** Pilih ukuran font & jumlah baris agar nama tim muat di irisannya tanpa terpotong. */
function fitLabel(label: string, seg: number, n: number): { lines: string[]; fs: number } {
  const maxFs = n <= 4 ? 26 : n <= 8 ? 22 : 18;
  // tinggi teks dibatasi lebar irisan di ujung dalam (bagian tersempit)
  const chord = 2 * TEXT_IN * Math.sin((Math.min(seg, 180) * Math.PI) / 360);
  const heightCap = n === 1 ? maxFs : chord * 0.78;

  const fs1 = Math.min(maxFs, heightCap, TEXT_LEN / (label.length * CHAR_W));
  let best = { lines: [label], fs: fs1 };

  const two = splitTwo(label);
  if (two) {
    const longest = Math.max(two[0].length, two[1].length);
    const fs2 = Math.min(maxFs, heightCap / 2.15, TEXT_LEN / (longest * CHAR_W));
    if (fs2 > fs1 + 0.5) best = { lines: two, fs: fs2 };
  }

  if (best.fs >= MIN_FS) return best;
  // tetap kekecilan: pakai satu baris dengan ukuran minimum dan potong sesedikit mungkin
  const fs = Math.max(MIN_FS, Math.min(maxFs, heightCap));
  const maxChars = Math.max(4, Math.floor(TEXT_LEN / (fs * CHAR_W)));
  return { lines: [label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label], fs };
}

/* ---------- suara (Web Audio, tanpa file) ---------- */
let audioCtx: AudioContext | null = null;
function ctx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}
function tone(freq: number, at: number, dur: number, vol: number, type: OscillatorType = "triangle") {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
const playTick = () => {
  tone(1500, 0, 0.03, 0.14, "square");
  tone(220, 0, 0.05, 0.12, "sine");
};
/** Desir angin yang melemah seiring roda melambat. */
function playWhoosh(ms: number) {
  const ac = ctx();
  if (!ac) return;
  const dur = ms / 1000;
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  const gain = ac.createGain();
  const t = ac.currentTime;
  filter.frequency.setValueAtTime(1800, t);
  filter.frequency.exponentialRampToValueAtTime(300, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.09, t + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t);
  src.stop(t + dur);
}
const playWin = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, i === 3 ? 0.6 : 0.16, 0.18));

/** Spin wheel SVG. Penunjuk ada di atas (jam 12). */
export const Wheel = forwardRef<WheelHandle, Props>(function Wheel({ items, disabled, muted, big, onResult, onSpinStart }, ref) {
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [pointerIdx, setPointerIdx] = useState(0);
  const rotRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const n = items.length;
  const seg = n > 0 ? 360 / n : 360;

  const labels = useMemo(() => items.map((it) => fitLabel(it.label, seg, n)), [items, seg, n]);

  const indexAt = (rot: number) => (n ? Math.floor(((((-rot % 360) + 360) % 360) / seg) % n) : 0);

  // daftar berubah (tim terundi keluar): sinkronkan nama di bawah penunjuk
  useEffect(() => {
    if (!spinning) setPointerIdx(indexAt(rotRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  useEffect(() => () => void (rafRef.current && cancelAnimationFrame(rafRef.current)), []);

  function spin() {
    if (spinning || disabled || n === 0) return;
    const index = randomInt(n);
    const picked = items[index];
    const jitter = (Math.random() - 0.5) * seg * 0.7;
    const target = (((-(index + 0.5) * seg + jitter) % 360) + 360) % 360;
    const startRot = rotRef.current;
    const current = ((startRot % 360) + 360) % 360;
    const delta = ((target - current + 360) % 360) + 360 * 8;

    setWinnerId(null);
    setSpinning(true);
    onSpinStart?.();
    if (!mutedRef.current) playWhoosh(SPIN_MS); // juga membuka AudioContext dalam gesture pengguna

    const t0 = performance.now();
    let lastIdx = indexAt(startRot);
    // detak mengikuti paku di pinggir roda (minimal 12 per putaran), jadi tetap berbunyi walau tim sedikit
    const pegs = Math.max(n, 12);
    const pegAt = (rot: number) => Math.floor(rot / (360 / pegs));
    let lastPeg = pegAt(startRot);

    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / SPIN_MS);
      const eased = 1 - Math.pow(1 - t, 4);
      const rot = startRot + delta * eased;
      rotRef.current = rot;
      if (svgRef.current) svgRef.current.style.transform = `rotate(${rot}deg)`;

      const idx = indexAt(rot);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setPointerIdx(idx);
      }
      const peg = pegAt(rot);
      if (peg !== lastPeg) {
        lastPeg = peg;
        if (!mutedRef.current) playTick();
        pointerRef.current?.animate([{ transform: "rotate(-22deg)" }, { transform: "rotate(0deg)" }], { duration: 140, easing: "ease-out" });
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      rafRef.current = null;
      setPointerIdx(index);
      setWinnerId(picked.id);
      if (!mutedRef.current) playWin();
      window.setTimeout(() => {
        setSpinning(false);
        onResult(picked);
      }, REVEAL_DELAY_MS);
    };
    rafRef.current = requestAnimationFrame(frame);
  }

  useImperativeHandle(ref, () => ({ spin }));

  const current = items[pointerIdx];
  const showWinner = winnerId !== null && items.some((it) => it.id === winnerId);

  return (
    <div className={`mx-auto w-full select-none ${big ? "max-w-[min(calc(100vh-330px),680px)]" : "max-w-[440px]"}`}>
      <div className="relative aspect-square w-full">
        {/* penunjuk */}
        <div ref={pointerRef} className="absolute left-1/2 top-[-2%] z-10 w-[10%] -translate-x-1/2 drop-shadow-lg" style={{ transformOrigin: "50% 25%" }}>
          <svg viewBox="0 0 44 52" className="w-full">
            <path d="M22 50 L4 10 A20 20 0 0 1 40 10 Z" fill="#ef4444" stroke="#fff" strokeWidth="3" />
            <circle cx="22" cy="16" r="6" fill="#fff" />
          </svg>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full drop-shadow-2xl"
          style={{ transform: `rotate(${rotRef.current}deg)` }}
          role="img"
          aria-label={`Roda undian berisi ${n} tim`}
        >
          <circle cx={C} cy={C} r={R + 10} fill="#0d203b" />
          {n === 0 && <circle cx={C} cy={C} r={R} fill="#e2e8f0" />}
          {n === 1 && <circle cx={C} cy={C} r={R} fill={COLORS[0].bg} />}
          {n > 1 &&
            items.map((it, i) => {
              const [x1, y1] = point(i * seg, R);
              const [x2, y2] = point((i + 1) * seg, R);
              const large = seg > 180 ? 1 : 0;
              const dim = showWinner && it.id !== winnerId;
              return (
                <path
                  key={it.id}
                  d={`M${C},${C} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`}
                  fill={colorFor(i, n).bg}
                  stroke="#ffffff"
                  strokeOpacity={showWinner && !dim ? 1 : 0.35}
                  strokeWidth={showWinner && !dim ? 5 : 1.5}
                  style={{ opacity: dim ? 0.3 : 1, transition: "opacity 400ms" }}
                />
              );
            })}

          {items.map((it, i) => {
            const { lines, fs } = labels[i];
            const fill = n === 1 ? "#fff" : colorFor(i, n).fg;
            const dim = showWinner && it.id !== winnerId;
            const common = { fontSize: fs, fontWeight: 800, fill, fontFamily: "Poppins, sans-serif", style: { opacity: dim ? 0.3 : 1, transition: "opacity 400ms" } } as const;

            if (n === 1) {
              // satu tim: tulis mendatar di bawah hub supaya tidak tertutup penunjuk
              const fs1 = Math.min(30, 300 / (it.label.length * CHAR_W));
              return (
                <text key={`t-${it.id}`} x={C} y={C + 120} textAnchor="middle" dominantBaseline="middle" {...common} fontSize={fs1}>
                  {it.label}
                </text>
              );
            }
            const mid = (i + 0.5) * seg;
            return (
              <g key={`t-${it.id}`} transform={`rotate(${mid - 90} ${C} ${C})`}>
                <text x={C + TEXT_OUT} y={C} textAnchor="end" dominantBaseline="middle" {...common}>
                  {lines.length === 1 ? (
                    lines[0]
                  ) : (
                    <>
                      <tspan x={C + TEXT_OUT} dy="-0.55em">
                        {lines[0]}
                      </tspan>
                      <tspan x={C + TEXT_OUT} dy="1.1em">
                        {lines[1]}
                      </tspan>
                    </>
                  )}
                </text>
              </g>
            );
          })}

          {Array.from({ length: Math.max(n, 12) }).map((_, i) => {
            const [x, y] = point((i * 360) / Math.max(n, 12), R + 5);
            return <circle key={`d-${i}`} cx={x} cy={y} r={3} fill="#7fd0ff" />;
          })}
        </svg>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || disabled || n === 0}
          className="absolute left-1/2 top-1/2 grid h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[6px] border-brand-navy bg-white text-brand-navy shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className={`display ${big ? "text-2xl" : "text-lg"}`}>{spinning ? "…" : "PUTAR"}</span>
        </button>
      </div>

      {/* nama di bawah penunjuk — untuk penonton live */}
      <div
        aria-live="polite"
        className={`${big ? "mt-3" : "mt-5"} flex min-h-[3.5rem] items-center justify-center rounded-2xl px-4 py-2 text-center transition ${
          showWinner ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-brand-navy text-white"
        }`}
      >
        {n === 0 ? (
          <span className="text-sm text-white/60">Roda kosong</span>
        ) : (
          <span className={`display leading-tight ${big ? "text-3xl" : "text-xl"}`}>
            {showWinner && "🏁 "}
            {current?.label ?? "—"}
          </span>
        )}
      </div>
    </div>
  );
});
