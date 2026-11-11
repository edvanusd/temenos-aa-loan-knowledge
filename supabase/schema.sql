-- =========================================================
-- AA Loan KB — skema database (Supabase / Postgres)
--
-- Cara pakai: Supabase → SQL Editor → New query → tempel seluruh
-- isi file ini → Run. Aman dijalankan ulang (idempotent).
--
-- Tabel:
--   profiles         satu baris per akun (nama, email, peran)
--   login_events     riwayat masuk / daftar / kunjungan
--   module_progress  modul yang ditandai selesai
--   quiz_attempts    setiap sesi quiz beserta jawabannya
--   card_progress    kartu interview & glosarium yang dikuasai
--   learner_summary  (view) ringkasan per peserta untuk halaman Admin
--   role_changes     catatan perubahan peran (dibuat lewat set_user_role)
--
-- Keamanan: Row Level Security aktif di semua tabel. Peserta hanya
-- bisa membaca & menulis datanya sendiri; admin bisa membaca semua.
-- =========================================================

-- ---------- 1. Tabel ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text not null default '',
  email        text not null default '',
  role         text not null default 'learner' check (role in ('learner', 'admin')),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.login_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null default 'login' check (kind in ('signup', 'login', 'visit')),
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists login_events_user_idx on public.login_events (user_id, created_at desc);
create index if not exists login_events_time_idx on public.login_events (created_at desc);

create table if not exists public.module_progress (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  module_key   text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_key)
);

create table if not exists public.quiz_attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  mode       text not null default 'quick',
  score      int  not null,
  total      int  not null,
  answers    jsonb not null default '[]'::jsonb,  -- [{ q: indeks soal, h: hash soal, a: jawaban, ok: benar? }]
  created_at timestamptz not null default now(),
  constraint quiz_score_valid check (total > 0 and score >= 0 and score <= total)
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, created_at desc);

create table if not exists public.card_progress (
  user_id  uuid not null references public.profiles (id) on delete cascade,
  deck     text not null check (deck in ('interview', 'glossary')),
  card_id  text not null,
  known_at timestamptz not null default now(),
  primary key (user_id, deck, card_id)
);

-- ---------- 2. Profil otomatis saat user mendaftar ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Isi profil untuk akun yang mungkin sudah terdaftar sebelum skema ini dijalankan
insert into public.profiles (id, full_name, email)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', ''), coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

-- ---------- 3. Fungsi bantu ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Catat masuk/daftar/kunjungan. 'visit' dicatat paling banyak sekali per 12 jam.
create or replace function public.record_login(p_kind text default 'login', p_user_agent text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles set last_seen_at = now() where id = auth.uid();
  if p_kind = 'visit' and exists (
    select 1 from public.login_events
    where user_id = auth.uid() and created_at > now() - interval '12 hours'
  ) then
    return;
  end if;
  insert into public.login_events (user_id, kind, user_agent)
  values (auth.uid(), p_kind, left(p_user_agent, 300));
end;
$$;

-- ---------- 4. Hak akses ----------
revoke all on public.profiles, public.login_events, public.module_progress,
              public.quiz_attempts, public.card_progress from anon;

-- Peserta hanya boleh mengubah nama & last_seen_at miliknya (bukan peran)
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, last_seen_at) on public.profiles to authenticated;

revoke update, delete on public.login_events, public.quiz_attempts from authenticated;
grant select, insert on public.login_events, public.quiz_attempts to authenticated;
grant select, insert, update, delete on public.module_progress, public.card_progress to authenticated;

revoke execute on function public.record_login(text, text) from public, anon;
grant execute on function public.record_login(text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------- 5. Row Level Security ----------
alter table public.profiles        enable row level security;
alter table public.login_events    enable row level security;
alter table public.module_progress enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.card_progress   enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "login_events_select" on public.login_events;
create policy "login_events_select" on public.login_events for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "login_events_insert_own" on public.login_events;
create policy "login_events_insert_own" on public.login_events for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "module_progress_select" on public.module_progress;
create policy "module_progress_select" on public.module_progress for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "module_progress_write_own" on public.module_progress;
create policy "module_progress_write_own" on public.module_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "quiz_attempts_select" on public.quiz_attempts;
create policy "quiz_attempts_select" on public.quiz_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own" on public.quiz_attempts for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "card_progress_select" on public.card_progress;
create policy "card_progress_select" on public.card_progress for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "card_progress_write_own" on public.card_progress;
create policy "card_progress_write_own" on public.card_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- 6. Ringkasan per peserta (untuk halaman Admin) ----------
-- security_invoker: view mengikuti RLS pemanggil, jadi peserta biasa
-- hanya melihat barisnya sendiri dan admin melihat semua.
create or replace view public.learner_summary
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.created_at,
  p.last_seen_at,
  (select count(*) from public.module_progress m where m.user_id = p.id)::int                        as modules_done,
  (select count(*) from public.quiz_attempts q where q.user_id = p.id)::int                          as quiz_attempts,
  (select max(round(100.0 * q.score / q.total)) from public.quiz_attempts q where q.user_id = p.id)::int as quiz_best_pct,
  (select round(100.0 * q.score / q.total) from public.quiz_attempts q
     where q.user_id = p.id order by q.created_at desc limit 1)::int                                 as quiz_last_pct,
  (select count(*) from public.card_progress c where c.user_id = p.id and c.deck = 'interview')::int as interview_known,
  (select count(*) from public.card_progress c where c.user_id = p.id and c.deck = 'glossary')::int  as glossary_known,
  (select count(*) from public.login_events l where l.user_id = p.id and l.kind in ('signup', 'login'))::int as login_count,
  (select max(l.created_at) from public.login_events l where l.user_id = p.id)                       as last_login_at
from public.profiles p;

revoke all on public.learner_summary from anon;
grant select on public.learner_summary to authenticated;

-- ---------- 7. Kelola peran dari website ----------
-- set_user_role(): hanya admin; admin terakhir tidak bisa diturunkan.
-- role_changes: catatan perubahan peran.
create table if not exists public.role_changes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  old_role   text not null,
  new_role   text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists role_changes_time_idx on public.role_changes (created_at desc);

alter table public.role_changes enable row level security;
revoke all on public.role_changes from anon, authenticated;
grant select on public.role_changes to authenticated;

drop policy if exists "role_changes_select_admin" on public.role_changes;
create policy "role_changes_select_admin" on public.role_changes for select to authenticated
  using ((select public.is_admin()));

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang bisa mengubah peran.' using errcode = '42501';
  end if;
  if p_role not in ('learner', 'admin') then
    raise exception 'Peran tidak dikenal: %', p_role using errcode = '22023';
  end if;

  -- Kunci baris admin agar dua perubahan bersamaan tidak menghapus semua admin
  perform 1 from public.profiles where role = 'admin' for update;

  select role into v_old from public.profiles where id = p_user_id for update;
  if v_old is null then
    raise exception 'Peserta tidak ditemukan.' using errcode = 'P0002';
  end if;
  if v_old = p_role then
    return;
  end if;
  if v_old = 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'Minimal harus ada satu admin. Jadikan peserta lain admin terlebih dulu.' using errcode = 'P0001';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
  insert into public.role_changes (user_id, old_role, new_role, changed_by)
  values (p_user_id, v_old, p_role, auth.uid());
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ---------- 8. Jadikan akunmu admin ----------
-- Setelah kamu mendaftar di website, ganti email di bawah lalu jalankan
-- baris ini saja (hapus tanda -- di depannya):
-- update public.profiles set role = 'admin' where email = 'email-kamu@domain.com';
