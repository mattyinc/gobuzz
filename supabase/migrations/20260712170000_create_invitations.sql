create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null unique,
  phone text,
  source text not null default 'teaser',
  status text not null default 'pending' check (status in ('pending', 'contacted', 'invited', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_created_at_idx
on public.invitations (created_at desc);

create index if not exists invitations_status_idx
on public.invitations (status, created_at desc);

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
before update on public.invitations
for each row
execute function public.set_updated_at();

alter table public.invitations enable row level security;

drop policy if exists "Admin users can read invitations" on public.invitations;
create policy "Admin users can read invitations"
on public.invitations
for select
to authenticated
using (true);

drop policy if exists "Admin users can update invitations" on public.invitations;
create policy "Admin users can update invitations"
on public.invitations
for update
to authenticated
using (true)
with check (true);
