-- =========================================================
-- AA Loan KB — tambahan: kelola peran dari website
--
-- Jalankan sekali di Supabase → SQL Editor (setelah schema.sql).
-- Aman dijalankan ulang. Isi file ini juga sudah termasuk di
-- bagian akhir schema.sql untuk instalasi baru.
--
-- - set_user_role(): hanya admin yang bisa mengubah peran;
--   admin terakhir tidak bisa diturunkan.
-- - role_changes: catatan siapa mengubah peran siapa, kapan.
-- =========================================================

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
