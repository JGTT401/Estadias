-- 1. Tabla profiles (vinculada a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  email text,
  role text default 'user'
);

-- 2. Roles (opcional, catálogo)
create table if not exists public.roles (
  id serial primary key,
  name text unique not null
);

insert into public.roles (name) values ('user') on conflict do nothing;
insert into public.roles (name) values ('admin') on conflict do nothing;

-- 3. Promotions
create table if not exists public.promotions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- 4. Visits (registro de escaneos)
create table if not exists public.visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  promotion_id uuid references public.promotions(id) on delete set null,
  created_at timestamptz default now()
);

-- 5. Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 6. Reward claims (relaciona usuario y promo desbloqueada)
create table if not exists public.reward_claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  promotion_id uuid references public.promotions(id) on delete cascade,
  claimed_at timestamptz default now()
);

-- 7. visit_points (opcional)
create table if not exists public.visit_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  points int default 0,
  updated_at timestamptz default now()
);

-- 8. Trigger seguro para crear profile al crear auth.user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise notice 'handle_new_user trigger error: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 9. RLS: habilitar y políticas (ajusta según seguridad)
-- Habilitar RLS en tablas sensibles
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.promotions enable row level security;
alter table public.reward_claims enable row level security;
alter table public.visits enable row level security;

-- Políticas para profiles: usuario puede select/update su propio perfil; admin puede todo
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'));

create policy "profiles_insert" on public.profiles
for insert with check (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'));

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'))
with check (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'));

-- Messages: recipient can read their messages; admin can read all
create policy "messages_select_recipient" on public.messages
for select using (recipient_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "messages_insert" on public.messages
for insert with check (recipient_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Promotions: public list allowed, but reward_claims control unlocked promos
create policy "promotions_select_public" on public.promotions
for select using (is_active = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "reward_claims_insert" on public.reward_claims
for insert with check (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Visits: user can insert their visits
create policy "visits_insert" on public.visits
for insert with check (user_id = auth.uid());

-- Nota: Ajusta políticas según tu modelo de seguridad.
