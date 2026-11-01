export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoading({ label = "Memuat…" }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-[40vh] place-items-center text-brand-navy">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-9 w-9" />
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
    </div>
  );
}
