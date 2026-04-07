
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  qr_code text not null unique,
  visits integer not null default 0 check (visits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_qr_code_idx on public.profiles (qr_code);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  min_visits integer not null default 1 check (min_visits >= 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists scans_created_at_idx on public.scans (created_at desc);
create index if not exists scans_user_id_idx on public.scans (user_id);

create table if not exists public.user_promotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, promotion_id)
);

create index if not exists user_promotions_user_id_idx on public.user_promotions (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

create table if not exists public.home_images (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  created_at timestamptz not null default now()
);

create or replace function public.increment_profile_visits_on_scan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set visits = coalesce(visits, 0) + 1,
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_scan_increment_visits on public.scans;
create trigger on_scan_increment_visits
  after insert on public.scans
  for each row
  execute function public.increment_profile_visits_on_scan();


create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;


alter table public.profiles enable row level security;
alter table public.promotions enable row level security;
alter table public.scans enable row level security;
alter table public.user_promotions enable row level security;
alter table public.messages enable row level security;
alter table public.home_images enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "promotions_select_visible" on public.promotions;
create policy "promotions_select_visible"
  on public.promotions for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.user_promotions up
      where up.user_id = auth.uid()
        and up.promotion_id = promotions.id
    )
  );

drop policy if exists "promotions_insert_admin" on public.promotions;
create policy "promotions_insert_admin"
  on public.promotions for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "promotions_update_admin" on public.promotions;
create policy "promotions_update_admin"
  on public.promotions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "promotions_delete_admin" on public.promotions;
create policy "promotions_delete_admin"
  on public.promotions for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "scans_insert_admin" on public.scans;
create policy "scans_insert_admin"
  on public.scans for insert
  to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

drop policy if exists "scans_select_admin" on public.scans;
create policy "scans_select_admin"
  on public.scans for select
  to authenticated
  using (public.is_admin());

drop policy if exists "user_promotions_select_own_or_admin" on public.user_promotions;
create policy "user_promotions_select_own_or_admin"
  on public.user_promotions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_promotions_insert_admin" on public.user_promotions;
create policy "user_promotions_insert_admin"
  on public.user_promotions for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "messages_select_authenticated" on public.messages;
create policy "messages_select_authenticated"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "messages_insert_admin" on public.messages;
create policy "messages_insert_admin"
  on public.messages for insert
  to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

drop policy if exists "Admins can insert home images" on public.home_images;
create policy "Admins can insert home images"
  on public.home_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can delete home images" on public.home_images;
create policy "Admins can delete home images"
  on public.home_images for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated users can read home images" on public.home_images;
create policy "Authenticated users can read home images"
  on public.home_images for select
  to authenticated
  using (true);
