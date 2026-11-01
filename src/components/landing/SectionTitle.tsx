export function SectionTitle({
  kicker,
  title,
  desc,
  light,
  center,
}: {
  kicker: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <span className="kicker">{kicker}</span>
      <h2 className={`display mt-4 text-4xl leading-none sm:text-5xl lg:text-6xl ${light ? "text-white" : "text-brand-navy"}`}>{title}</h2>
      {desc && <p className={`mt-4 text-base sm:text-lg ${light ? "text-white/85" : "text-slate-600"}`}>{desc}</p>}
    </div>
  );
}
