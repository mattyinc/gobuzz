create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  facility text not null check (facility in ('sauna-men', 'sauna-women', 'ice-bath')),
  date date not null,
  start text not null check (start ~ '^[0-2][0-9]:[0-5][0-9]$'),
  spots integer not null default 1 check (spots > 0),
  name text not null,
  email text not null,
  phone text,
  status text not null default 'confirmed' check (status in ('confirmed', 'checked-in', 'completed', 'cancelled', 'no-show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_slot_idx on public.bookings (facility, date, start);
create index if not exists bookings_date_idx on public.bookings (date, start);
create index if not exists bookings_code_idx on public.bookings (code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "Admin users can read bookings" on public.bookings;
create policy "Admin users can read bookings"
on public.bookings
for select
to authenticated
using (true);

drop policy if exists "Admin users can update bookings" on public.bookings;
create policy "Admin users can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);

create or replace function public.create_booking(
  p_facility text,
  p_date date,
  p_start text,
  p_spots integer,
  p_name text,
  p_email text,
  p_phone text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_taken integer;
  v_remaining integer;
  v_code text;
  v_booking public.bookings;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  v_capacity := case p_facility
    when 'sauna-men' then 5
    when 'sauna-women' then 5
    when 'ice-bath' then 1
    else null
  end;

  if v_capacity is null then
    raise exception 'Unknown facility';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_facility || ':' || p_date::text || ':' || p_start));

  select coalesce(sum(spots), 0)
  into v_taken
  from public.bookings
  where facility = p_facility
    and date = p_date
    and start = p_start
    and status in ('confirmed', 'checked-in');

  v_remaining := v_capacity - v_taken;
  if p_spots > v_remaining then
    raise exception 'slot_full:%', greatest(v_remaining, 0);
  end if;

  loop
    v_code := 'GB-';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, floor(random() * length(v_alphabet) + 1)::integer, 1);
    end loop;
    exit when not exists (select 1 from public.bookings where code = v_code);
  end loop;

  insert into public.bookings (code, facility, date, start, spots, name, email, phone)
  values (v_code, p_facility, p_date, p_start, p_spots, p_name, lower(p_email), nullif(p_phone, ''))
  returning * into v_booking;

  return v_booking;
end;
$$;
