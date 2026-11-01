-- =====================================================================
--  HEABIT 2026 — Skema Supabase
--  Jalankan seluruh file ini sekali di Supabase Dashboard → SQL Editor.
--  Aman dijalankan ulang (idempotent) untuk tabel/fungsi/policy.
-- =====================================================================

-- gen_random_uuid() sudah bawaan PostgreSQL 13+ (Supabase)

-- ---------------------------------------------------------------------
-- 1. ADMIN
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2. PENGATURAN EVENT (1 baris)
-- ---------------------------------------------------------------------
create table if not exists public.event_settings (
  id                int primary key default 1 check (id = 1),
  quota             int     not null default 15 check (quota between 1 and 100),
  registration_open boolean not null default true,
  updated_at        timestamptz not null default now()
);
insert into public.event_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. TIM / KOMUNITAS & PESERTA
-- ---------------------------------------------------------------------
do $$ begin
  create type public.team_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.teams (
  id             uuid primary key default gen_random_uuid(),
  community_name text not null check (char_length(trim(community_name)) between 2 and 80),
  pic_name       text not null check (char_length(trim(pic_name)) between 2 and 80),
  pic_phone      text not null check (pic_phone ~ '^62[0-9]{8,13}$'),
  join_cheering  boolean not null default false,
  cheering_count int,
  status         public.team_status not null default 'pending',
  admin_note     text,
  created_at     timestamptz not null default now(),
  constraint cheering_count_valid check (
    (join_cheering and cheering_count between 1 and 200)
    or (not join_cheering and cheering_count is null)
  )
);
create unique index if not exists teams_community_name_key
  on public.teams (lower(trim(community_name)));

create table if not exists public.participants (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  full_name  text not null check (char_length(trim(full_name)) between 2 and 80),
  gender     text not null check (gender in ('L', 'P')),
  role       text not null check (role in ('utama', 'cadangan')),
  slot       smallint not null check (slot between 1 and 3),
  photo_path text not null,
  created_at timestamptz not null default now(),
  unique (team_id, gender, role, slot)
);
create index if not exists participants_team_idx on public.participants (team_id);

-- ---------------------------------------------------------------------
-- 4. UNDIAN / BAGAN
--    kualifikasi : grup A, B, C  (maks 5 tim)  → peringkat 1-3 lolos
--    semifinal   : grup S1,S2,S3 (maks 3 tim)  → peringkat 1 ke final
--    final       : grup F        (3 tim)       → juara 1, 2, 3
-- ---------------------------------------------------------------------
create table if not exists public.draw_entries (
  id         uuid primary key default gen_random_uuid(),
  stage      text not null check (stage in ('kualifikasi', 'semifinal', 'final')),
  group_code text not null check (group_code in ('A','B','C','S1','S2','S3','F')),
  position   smallint not null check (position between 1 and 5),
  team_id    uuid not null references public.teams (id) on delete cascade,
  rank       smallint check (rank between 1 and 5),
  created_at timestamptz not null default now(),
  unique (stage, team_id),
  unique (stage, group_code, position)
);

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
--    Publik TIDAK bisa membaca data peserta. Pendaftaran lewat RPC
--    register_team(); data publik lewat public_stats() & public_bracket().
-- ---------------------------------------------------------------------
alter table public.admins         enable row level security;
alter table public.event_settings enable row level security;
alter table public.teams          enable row level security;
alter table public.participants   enable row level security;
alter table public.draw_entries   enable row level security;

drop policy if exists "admin read self"      on public.admins;
create policy "admin read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "admin manage settings" on public.event_settings;
create policy "admin manage settings" on public.event_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage teams" on public.teams;
create policy "admin manage teams" on public.teams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage participants" on public.participants;
create policy "admin manage participants" on public.participants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage draws" on public.draw_entries;
create policy "admin manage draws" on public.draw_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. STORAGE: bucket privat untuk foto peserta
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('participant-photos', 'participant-photos', false, 3145728,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "heabit public upload" on storage.objects;
create policy "heabit public upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'participant-photos'
    and (storage.foldername(name))[1] = 'registrations'
  );

drop policy if exists "heabit admin read" on storage.objects;
create policy "heabit admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'participant-photos' and public.is_admin());

drop policy if exists "heabit admin delete" on storage.objects;
create policy "heabit admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'participant-photos' and public.is_admin());

-- ---------------------------------------------------------------------
-- 7. RPC PUBLIK
-- ---------------------------------------------------------------------

-- Statistik ringkas untuk landing page
create or replace function public.public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'quota',             s.quota,
    'registration_open', s.registration_open,
    'registered',        (select count(*) from public.teams where status <> 'rejected'),
    'approved',          (select count(*) from public.teams where status = 'approved')
  )
  from public.event_settings s
  where s.id = 1;
$$;

-- Bagan undian (hanya nama komunitas, tanpa data pribadi)
create or replace function public.public_bracket()
returns table (stage text, group_code text, "position" smallint, community_name text, rank smallint)
language sql
stable
security definer
set search_path = public
as $$
  select d.stage, d.group_code, d.position, t.community_name, d.rank
  from public.draw_entries d
  join public.teams t on t.id = d.team_id
  order by d.stage, d.group_code, d.position;
$$;

-- Pendaftaran komunitas (atomik + validasi di server)
-- payload:
-- {
--   "community_name": "...", "pic_name": "...", "pic_phone": "62812...",
--   "join_cheering": true, "cheering_count": 25,
--   "participants": [
--     {"full_name":"...", "gender":"L", "role":"utama", "slot":1, "photo_path":"registrations/<uuid>/L-utama-1.jpg"},
--     ... total 7 orang: 3 L utama, 2 P utama, 1 L cadangan, 1 P cadangan
--   ]
-- }
create or replace function public.register_team(payload jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  s          public.event_settings%rowtype;
  v_team_id  uuid;
  v_count    int;
  v_name     text := trim(coalesce(payload->>'community_name', ''));
  v_pic      text := trim(coalesce(payload->>'pic_name', ''));
  v_phone    text := regexp_replace(coalesce(payload->>'pic_phone', ''), '[^0-9]', '', 'g');
  v_cheer    boolean := coalesce((payload->>'join_cheering')::boolean, false);
  v_cheer_n  int := nullif(payload->>'cheering_count', '')::int;
  v_parts    jsonb := coalesce(payload->'participants', '[]'::jsonb);
  p          jsonb;
begin
  select * into s from public.event_settings where id = 1;
  if not s.registration_open then
    raise exception 'PENDAFTARAN_DITUTUP';
  end if;

  -- kunci agar kuota tidak terlampaui saat banyak pendaftar bersamaan
  perform pg_advisory_xact_lock(hashtext('heabit_register'));
  select count(*) into v_count from public.teams where status <> 'rejected';
  if v_count >= s.quota then
    raise exception 'KUOTA_PENUH';
  end if;

  if v_phone like '0%' then v_phone := '62' || substr(v_phone, 2); end if;
  if v_phone like '8%' then v_phone := '62' || v_phone; end if;

  if jsonb_typeof(v_parts) <> 'array' or jsonb_array_length(v_parts) <> 7 then
    raise exception 'JUMLAH_PESERTA_TIDAK_VALID';
  end if;

  if (select count(*) from jsonb_array_elements(v_parts) e where e->>'gender' = 'L' and e->>'role' = 'utama') <> 3
  or (select count(*) from jsonb_array_elements(v_parts) e where e->>'gender' = 'P' and e->>'role' = 'utama') <> 2
  or (select count(*) from jsonb_array_elements(v_parts) e where e->>'gender' = 'L' and e->>'role' = 'cadangan') <> 1
  or (select count(*) from jsonb_array_elements(v_parts) e where e->>'gender' = 'P' and e->>'role' = 'cadangan') <> 1 then
    raise exception 'KOMPOSISI_PESERTA_TIDAK_VALID';
  end if;

  if not v_cheer then
    v_cheer_n := null;
  elsif v_cheer_n is null or v_cheer_n < 1 or v_cheer_n > 200 then
    raise exception 'JUMLAH_CHEERING_TIDAK_VALID';
  end if;

  insert into public.teams (community_name, pic_name, pic_phone, join_cheering, cheering_count)
  values (v_name, v_pic, v_phone, v_cheer, v_cheer_n)
  returning id into v_team_id;

  for p in select * from jsonb_array_elements(v_parts) loop
    if not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'participant-photos' and o.name = p->>'photo_path'
    ) or (p->>'photo_path') not like 'registrations/%' then
      raise exception 'FOTO_TIDAK_DITEMUKAN';
    end if;

    insert into public.participants (team_id, full_name, gender, role, slot, photo_path)
    values (
      v_team_id,
      trim(p->>'full_name'),
      p->>'gender',
      p->>'role',
      (p->>'slot')::smallint,
      p->>'photo_path'
    );
  end loop;

  return json_build_object('id', v_team_id, 'code', upper(substr(replace(v_team_id::text, '-', ''), 1, 8)));
exception
  when unique_violation then
    raise exception 'NAMA_KOMUNITAS_SUDAH_TERDAFTAR';
  when check_violation then
    raise exception 'DATA_TIDAK_VALID';
end;
$$;

-- ---------------------------------------------------------------------
-- 8. RPC ADMIN — undian (spin wheel)
-- ---------------------------------------------------------------------

-- Memasukkan tim hasil putaran ke grup yang paling sedikit isinya
create or replace function public.draw_assign(p_stage text, p_team uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_groups text[];
  v_cap    int;
  v_group  text;
  v_pos    int;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  if p_stage = 'kualifikasi' then
    v_groups := array['A','B','C']; v_cap := 5;
    if not exists (select 1 from public.teams where id = p_team and status = 'approved') then
      raise exception 'TIM_BELUM_DISETUJUI';
    end if;
  elsif p_stage = 'semifinal' then
    v_groups := array['S1','S2','S3']; v_cap := 3;
    if not exists (select 1 from public.draw_entries
                   where stage = 'kualifikasi' and team_id = p_team and rank between 1 and 3) then
      raise exception 'TIM_TIDAK_LOLOS_KUALIFIKASI';
    end if;
  else
    raise exception 'TAHAP_TIDAK_VALID';
  end if;

  perform pg_advisory_xact_lock(hashtext('heabit_draw_' || p_stage));

  if exists (select 1 from public.draw_entries where stage = p_stage and team_id = p_team) then
    raise exception 'TIM_SUDAH_DIUNDI';
  end if;

  select g.code into v_group
  from unnest(v_groups) with ordinality as g(code, ord)
  left join lateral (
    select count(*) as n from public.draw_entries d
    where d.stage = p_stage and d.group_code = g.code
  ) c on true
  where c.n < v_cap
  order by c.n, g.ord
  limit 1;

  if v_group is null then
    raise exception 'SLOT_PENUH';
  end if;

  select coalesce(max(position), 0) + 1 into v_pos
  from public.draw_entries where stage = p_stage and group_code = v_group;

  insert into public.draw_entries (stage, group_code, position, team_id)
  values (p_stage, v_group, v_pos, p_team);

  return json_build_object('group_code', v_group, 'position', v_pos);
end;
$$;

-- Menetapkan finalis = juara 1 tiap semifinal
create or replace function public.set_finalists()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_n int;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;
  delete from public.draw_entries where stage = 'final';
  insert into public.draw_entries (stage, group_code, position, team_id)
  select 'final', 'F', row_number() over (order by group_code), team_id
  from public.draw_entries
  where stage = 'semifinal' and rank = 1;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- ---------------------------------------------------------------------
-- 9. HAK AKSES FUNGSI
-- ---------------------------------------------------------------------
revoke all on function public.register_team(jsonb)      from public;
revoke all on function public.draw_assign(text, uuid)   from public;
revoke all on function public.set_finalists()           from public;

grant execute on function public.public_stats()          to anon, authenticated;
grant execute on function public.public_bracket()        to anon, authenticated;
grant execute on function public.register_team(jsonb)    to anon, authenticated;
grant execute on function public.is_admin()              to authenticated;
grant execute on function public.draw_assign(text, uuid) to authenticated;
grant execute on function public.set_finalists()         to authenticated;

-- ---------------------------------------------------------------------
-- 10. MENJADIKAN AKUN SEBAGAI ADMIN
--     1) Supabase Dashboard → Authentication → Users → Add user (email + password)
--     2) Jalankan (ganti email):
--        insert into public.admins (user_id)
--        select id from auth.users where email = 'admin@heabit.id'
--        on conflict do nothing;
-- ---------------------------------------------------------------------
