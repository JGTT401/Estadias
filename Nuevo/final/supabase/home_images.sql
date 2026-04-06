create table if not exists public.home_images (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  created_at timestamptz not null default now()
);

alter table public.home_images enable row level security;

drop policy if exists "Admins can insert home images" on public.home_images;
create policy "Admins can insert home images"
  on public.home_images
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can delete home images" on public.home_images;
create policy "Admins can delete home images"
  on public.home_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Authenticated users can read home images" on public.home_images;
create policy "Authenticated users can read home images"
  on public.home_images
  for select
  to authenticated
  using (true);
