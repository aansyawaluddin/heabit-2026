"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ROSTER, type RosterKey } from "@/lib/event";
import { friendlyError } from "@/lib/errors";
import { compressImage, normalizePhone } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv, PHOTO_BUCKET } from "@/lib/supabase/env";
import { Spinner } from "@/components/Spinner";
import { PersonField, type PersonValue } from "./PersonField";

type People = Record<RosterKey, PersonValue>;
type Errors = Partial<Record<string, string>>;

const emptyPeople = () =>
  Object.fromEntries(ROSTER.map((r) => [r.key, { name: "", file: null, preview: null }])) as unknown as People;

const MAX_FILE_MB = 15;

export function RegistrationForm() {
  const [community, setCommunity] = useState("");
  const [picName, setPicName] = useState("");
  const [picPhone, setPicPhone] = useState("");
  const [people, setPeople] = useState<People>(emptyPeople);
  const [cheer, setCheer] = useState<"" | "ya" | "tidak">("");
  const [cheerCount, setCheerCount] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string } | null>(null);

  const busy = phase === "uploading" || phase === "saving";
  const main = ROSTER.filter((r) => r.role === "utama");
  const reserve = ROSTER.filter((r) => r.role === "cadangan");
  const filled = useMemo(() => ROSTER.filter((r) => people[r.key].name.trim() && people[r.key].file).length, [people]);

  function setPerson(key: RosterKey, v: PersonValue) {
    setPeople((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (community.trim().length < 2) e.community = "Nama komunitas wajib diisi.";
    if (picName.trim().length < 2) e.picName = "Nama penanggung jawab wajib diisi.";
    const phone = normalizePhone(picPhone);
    if (!/^62[0-9]{8,13}$/.test(phone)) e.picPhone = "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx).";

    for (const r of ROSTER) {
      const p = people[r.key];
      const n = p.name.trim().replace(/\s+/g, " ");
      if (n.length < 2) e[r.key] = "Nama wajib diisi.";
      if (!p.file) e[r.key] = e[r.key] ? `${e[r.key]} Foto juga wajib.` : "Foto wajib diunggah.";
      else if (p.file.size > MAX_FILE_MB * 1024 * 1024) e[r.key] = `Ukuran foto maksimal ${MAX_FILE_MB} MB.`;
    }

    if (!cheer) e.cheer = "Pilih apakah komunitas ikut lomba cheering.";
    if (cheer === "ya") {
      const n = Number(cheerCount);
      if (!Number.isInteger(n) || n < 1 || n > 200) e.cheerCount = "Isi jumlah anggota cheering (1–200 orang).";
    }
    if (!agree) e.agree = "Centang persetujuan sebelum mengirim.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!hasSupabaseEnv) {
      setSubmitError("Supabase belum dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
      return;
    }

    const supabase = createClient();
    const uploadId = crypto.randomUUID();
    try {
      setPhase("uploading");
      setProgress(0);
      const participants = [];
      for (const [i, r] of ROSTER.entries()) {
        const p = people[r.key];
        let blob: Blob;
        try {
          blob = await compressImage(p.file as File);
        } catch {
          throw new Error(`Foto ${r.label} tidak bisa dibaca. Gunakan format JPG atau PNG.`);
        }
        const path = `registrations/${uploadId}/${r.key}.jpg`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw new Error(`Gagal mengunggah foto ${r.label}: ${error.message}`);
        participants.push({ full_name: p.name.trim().replace(/\s+/g, " "), gender: r.gender, role: r.role, slot: r.slot, photo_path: path });
        setProgress(Math.round(((i + 1) / ROSTER.length) * 100));
      }

      setPhase("saving");
      const { data, error } = await supabase.rpc("register_team", {
        payload: {
          community_name: community.trim().replace(/\s+/g, " "),
          pic_name: picName.trim(),
          pic_phone: normalizePhone(picPhone),
          join_cheering: cheer === "ya",
          cheering_count: cheer === "ya" ? Number(cheerCount) : null,
          participants,
        },
      });
      if (error) throw new Error(friendlyError(error.message));
      setResult({ code: (data as { code: string }).code });
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setPhase("idle");
      setSubmitError(err instanceof Error ? err.message : friendlyError(null));
    }
  }

  if (phase === "done" && result) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">✓</div>
        <h2 className="display mt-5 text-4xl text-brand-navy">Pendaftaran terkirim!</h2>
        <p className="mt-3 text-slate-600">
          Terima kasih, <b>{community}</b>. Data tim sedang diverifikasi panitia. Konfirmasi akan dikirim ke WhatsApp penanggung jawab.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto grid max-w-4xl gap-6">
      {/* 1. Komunitas */}
      <Section n={1} title="Data Komunitas" desc="Nama komunitas akan tampil di bagan undian.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="community" label="Nama komunitas" error={errors.community} className="sm:col-span-2">
            <input
              id="community"
              className="input"
              placeholder="contoh: Makassar Runners"
              value={community}
              maxLength={80}
              disabled={busy}
              onChange={(e) => setCommunity(e.target.value)}
            />
          </Field>
          <Field id="picName" label="Nama penanggung jawab" error={errors.picName}>
            <input id="picName" className="input" placeholder="Nama kapten / PIC" value={picName} maxLength={80} disabled={busy} onChange={(e) => setPicName(e.target.value)} />
          </Field>
          <Field id="picPhone" label="No. WhatsApp penanggung jawab" error={errors.picPhone}>
            <input
              id="picPhone"
              className="input"
              placeholder="0812xxxxxxxx"
              inputMode="tel"
              value={picPhone}
              maxLength={20}
              disabled={busy}
              onChange={(e) => setPicPhone(e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* 2. Pelari utama */}
      <Section n={2} title="Pelari Utama Relay" desc="5 pelari: 3 putra dan 2 putri. Setiap pelari wajib mengunggah foto.">
        <div className="grid gap-4 md:grid-cols-2">
          {main.map((r) => (
            <div key={r.key} data-error={Boolean(errors[r.key])}>
              <PersonField label={r.label} tone={r.gender} value={people[r.key]} error={errors[r.key]} disabled={busy} onChange={(v) => setPerson(r.key, v)} />
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Cadangan */}
      <Section n={3} title="Pelari Cadangan" desc="1 cadangan putra dan 1 cadangan putri, masing-masing dengan foto.">
        <div className="grid gap-4 md:grid-cols-2">
          {reserve.map((r) => (
            <div key={r.key} data-error={Boolean(errors[r.key])}>
              <PersonField label={r.label} tone={r.gender} value={people[r.key]} error={errors[r.key]} disabled={busy} onChange={(v) => setPerson(r.key, v)} />
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Cheering */}
      <Section n={4} title="Lomba Cheering" desc="Apakah komunitas ikut serta dalam lomba cheering?">
        <div data-error={Boolean(errors.cheer)} className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { v: "ya", t: "Ya, ikut cheering", d: "Kami membawa tim supporter" },
              { v: "tidak", t: "Tidak ikut", d: "Hanya mengikuti lomba relay" },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                cheer === o.v ? "border-brand bg-brand-sky" : "border-slate-200 hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="cheer"
                value={o.v}
                checked={cheer === o.v}
                disabled={busy}
                onChange={() => {
                  setCheer(o.v);
                  setErrors((e) => ({ ...e, cheer: undefined, cheerCount: undefined }));
                }}
                className="mt-1 h-4 w-4 accent-[#3385ce]"
              />
              <span>
                <span className="block font-bold text-brand-navy">{o.t}</span>
                <span className="text-sm text-slate-500">{o.d}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.cheer && <p className="mt-2 text-sm font-semibold text-red-600">{errors.cheer}</p>}

        {cheer === "ya" && (
          <div className="mt-4 max-w-xs" data-error={Boolean(errors.cheerCount)}>
            <Field id="cheerCount" label="Jumlah anggota cheering" error={errors.cheerCount}>
              <div className="relative">
                <input
                  id="cheerCount"
                  className="input pr-16"
                  type="number"
                  min={1}
                  max={200}
                  inputMode="numeric"
                  placeholder="contoh: 20"
                  value={cheerCount}
                  disabled={busy}
                  onChange={(e) => setCheerCount(e.target.value)}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">orang</span>
              </div>
            </Field>
          </div>
        )}
      </Section>

      {/* 5. Konfirmasi */}
      <div className="card p-6 sm:p-8">
        <label className="flex cursor-pointer items-start gap-3" data-error={Boolean(errors.agree)}>
          <input type="checkbox" checked={agree} disabled={busy} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-[#3385ce]" />
          <span className="text-sm text-slate-600">
            Saya menyatakan data di atas benar, seluruh peserta sudah menyetujui pendaftaran ini, dan foto peserta boleh digunakan panitia
            untuk keperluan verifikasi dan ID card lomba.
          </span>
        </label>
        {errors.agree && <p className="mt-2 text-sm font-semibold text-red-600">{errors.agree}</p>}

        {submitError && (
          <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Kelengkapan peserta: <b className="text-brand-navy">{filled}/7</b>
          </p>
          <button type="submit" disabled={busy} className="btn-primary px-8 py-4 text-base">
            {busy && <Spinner />}
            {phase === "uploading" ? `Mengunggah foto… ${progress}%` : phase === "saving" ? "Menyimpan data…" : "Kirim Pendaftaran"}
          </button>
        </div>
        {busy && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${phase === "saving" ? 100 : progress}%` }} />
          </div>
        )}
      </div>
    </form>
  );
}

function Section({ n, title, desc, children }: { n: number; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-5 flex items-start gap-4">
        <span className="display grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-navy text-lg text-white">{n}</span>
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy">{title}</h2>
          {desc && <p className="text-sm text-slate-500">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className} data-error={Boolean(error)}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
