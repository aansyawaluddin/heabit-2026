"use client";

import { useId, useRef } from "react";

export interface PersonValue {
  name: string;
  file: File | null;
  preview: string | null;
}

export function PersonField({
  label,
  tone,
  value,
  error,
  disabled,
  onChange,
}: {
  label: string;
  tone: "L" | "P";
  value: PersonValue;
  error?: string;
  disabled?: boolean;
  onChange: (v: PersonValue) => void;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    if (value.preview) URL.revokeObjectURL(value.preview);
    onChange({ ...value, file, preview: URL.createObjectURL(file) });
  }

  return (
    <div className={`rounded-2xl border p-4 transition ${error ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"}`}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-extrabold text-white ${tone === "L" ? "bg-brand" : "bg-pink-500"}`}
        >
          {tone === "L" ? "♂" : "♀"}
        </span>
        <span className="text-sm font-bold text-brand-navy">{label}</span>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className={`relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed text-center transition ${
            value.preview ? "border-transparent" : "border-slate-300 hover:border-brand hover:bg-brand-sky"
          }`}
          aria-label={`Unggah foto ${label}`}
        >
          {value.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.preview} alt={`Foto ${label}`} className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-[11px] font-semibold leading-tight text-slate-500">
              <svg viewBox="0 0 24 24" className="mx-auto mb-1 h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              Unggah foto
            </span>
          )}
        </button>
        <div className="flex-1">
          <label htmlFor={id} className="sr-only">
            Nama lengkap {label}
          </label>
          <input
            id={id}
            className="input"
            placeholder="Nama lengkap"
            value={value.name}
            maxLength={80}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            autoComplete="off"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{value.file ? value.file.name : "Foto wajah jelas, JPG/PNG"}</p>
            {value.preview && (
              <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className="text-xs font-bold text-brand hover:underline">
                Ganti
              </button>
            )}
          </div>
          {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
