-- La Ograda — schema inițial Supabase (Postgres)
-- Rulează acest fișier în Supabase Studio > SQL Editor (sau via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'processing', 'paid', 'failed', 'refunded')),
  total_amount numeric(10, 2),
  currency text not null default 'RON',
  netopia_order_id text,
  created_at timestamptz not null default now(),
  constraint check_out_after_check_in check (check_out > check_in)
);

create index if not exists bookings_check_in_check_out_idx on public.bookings (check_in, check_out);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: no public read/write. All access goes through Route
-- Handlers using the service role key (see src/lib/supabase/admin.ts), which
-- validates input with zod before touching the database.
alter table public.bookings enable row level security;
alter table public.contact_messages enable row level security;
