# HEABIT 2026 — Website Event

Next.js 15 (App Router) + Supabase untuk **HEABIT (Heavan Bitte) Relay & Cheering Competition · Heavan Run Vol. 3**.

## Fitur

**Publik**
- `/` — landing page: hero + hitung mundur, latar belakang, kategori (Relay & Cheering), **bagan sistem klasifikasi** (otomatis terisi dari hasil undian), hadiah podium, waktu/lokasi/denah rute, galeri, kontak.
- `/daftar` — form pendaftaran komunitas:
  - nama komunitas, penanggung jawab + WhatsApp
  - 3 pelari putra, 2 pelari putri, 1 cadangan putra, 1 cadangan putri (nama + **foto wajib** tiap orang)
  - validasi ikut cheering (Ya/Tidak) → jika Ya, wajib isi jumlah anggota cheering
  - foto dikompres di browser (maks 1200px) lalu diunggah ke Supabase Storage (bucket privat)
  - kuota & status buka/tutup dicek di server (aman dari pendaftaran ganda/berlebih)

**Admin** (`/admin`, login Supabase Auth)
- Manajemen peserta: statistik, cari & filter status, detail tim + foto peserta, setujui/tunda/tolak, ubah nama peserta, catatan internal, hapus tim (beserta fotonya), **export CSV**, atur kuota & buka/tutup pendaftaran.
- Undian & Bagan (**spin wheel**):
  1. **Kualifikasi** — roda berisi tim berstatus *Disetujui*; tiap putaran mengisi Match 1–3 bergiliran (maks 5 tim/match). Isi peringkat 1–5 setelah race; peringkat 1–3 lolos.
  2. **Semifinal** — roda berisi 9 tim yang lolos; diundi ulang ke Semifinal 1–3 (3 tim/match). Juara 1 tiap match ke final.
  3. **Final** — tombol *Tetapkan Finalis*, lalu isi Juara 1/2/3.
  - Bisa keluarkan tim dari bagan atau reset satu tahap (beserta tahap sesudahnya).

## Setup

### 1. Supabase
1. Buat project di <https://supabase.com>.
2. **SQL Editor** → tempel isi `supabase/schema.sql` → **Run**. (Membuat tabel, RLS, fungsi RPC, dan bucket `participant-photos`.)
3. **Authentication → Sign In / Providers**: pastikan *Email* aktif, lalu **matikan "Allow new users to sign up"** supaya orang lain tidak bisa membuat akun.
4. **Authentication → Users → Add user** → isi email & password admin (centang *Auto Confirm User*).
5. Jadikan admin (SQL Editor, ganti email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@heabit.id'
   on conflict do nothing;
   ```

### 2. Aplikasi
```bash
cp .env.example .env.local   # isi URL & anon key dari Supabase → Project Settings → API
npm install
npm run dev                  # http://localhost:3000
```

### 3. Deploy
- **Vercel**: import repo, isi Environment Variables yang sama dengan `.env.local`, deploy.
- **VPS (PM2 + Nginx)**:
  ```bash
  npm ci && npm run build
  pm2 start npm --name heabit -- start -- -p 3000
  ```
  Arahkan Nginx `proxy_pass http://127.0.0.1:3000;`.

## Struktur
```
supabase/schema.sql          skema database, RLS, RPC, storage
src/app/page.tsx             landing page
src/app/daftar/              form pendaftaran
src/app/admin/login/         login admin
src/app/admin/(panel)/       dashboard peserta, detail tim, undian
src/app/admin/actions.ts     server actions admin
src/app/admin/export/        export CSV
src/components/landing/      section landing (Bracket = bagan klasifikasi)
src/components/form/         komponen form pendaftaran
src/components/admin/        tabel peserta, spin wheel, papan undian
src/lib/event.ts             data event (tanggal, hadiah, kontak, komposisi tim) — ubah di sini
public/img/                  foto & logo dari proposal
```

## Catatan keamanan
- Data peserta & foto **tidak bisa dibaca publik** (RLS + bucket privat). Admin melihat foto lewat signed URL 1 jam.
- Pendaftaran hanya lewat fungsi `register_team()` yang memvalidasi komposisi 3 putra + 2 putri + 2 cadangan, keberadaan foto, kuota, dan status pendaftaran.
- Landing page hanya membaca `public_stats()` dan `public_bracket()` (nama komunitas saja).
