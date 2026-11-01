import { EVENT } from "@/lib/event";

export function Marquee() {
  const items = [...EVENT.hashtags, "RELAY 5 × ±1 KM", "CHEERING COMPETITION", "15 KOMUNITAS LARI", ...EVENT.hashtags];
  return (
    <div className="overflow-hidden bg-brand-navy py-4 text-white">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="display flex items-center gap-10 text-xl text-white/90">
            {t}
            <span className="h-2 w-2 rotate-45 bg-brand-ice" />
          </span>
        ))}
      </div>
    </div>
  );
}
