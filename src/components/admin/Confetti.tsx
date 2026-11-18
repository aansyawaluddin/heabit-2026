"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#3385ce", "#7fd0ff", "#ffffff", "#fbbf24", "#34d399", "#f87171"];

/** Ledakan konfeti sekali jalan (canvas, tanpa dependensi). */
export function Confetti({ duration = 3200 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const parts = Array.from({ length: 180 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const angle = (fromLeft ? -60 : -120) + (Math.random() - 0.5) * 40;
      const speed = 9 + Math.random() * 9;
      return {
        x: fromLeft ? 0 : W,
        y: H * 0.75,
        vx: Math.cos((angle * Math.PI) / 180) * speed,
        vy: Math.sin((angle * Math.PI) / 180) * speed,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length],
      };
    });

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - t0;
      g.clearRect(0, 0, W, H);
      g.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - duration * 0.6) / (duration * 0.4));
      for (const p of parts) {
        p.vy += 0.25;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        g.restore();
      }
      if (elapsed < duration) raf = requestAnimationFrame(tick);
      else g.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [duration]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
