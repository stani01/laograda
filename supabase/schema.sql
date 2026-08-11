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

-- ---------------------------------------------------------------------------
-- Admin-editable site content (managed from /admin by the owners)
-- ---------------------------------------------------------------------------

-- Singleton row (id is always 1) holding the editable text/price fields.
create table if not exists public.site_settings (
  id integer primary key default 1,
  hero_subtitle text not null default 'Casă de vacanță la poalele Munților Făgăraș, cu vedere superbă la munte, curte generoasă și râu în apropiere.',
  about_text text not null default 'O casă de vacanță primitoare la poalele Munților Făgăraș — locul perfect pentru o evadare din oraș, weekenduri liniștite și vacanțe în familie.',
  address text not null default 'Valea Avrigului, Județul Sibiu',
  maps_url text not null default 'https://maps.app.goo.gl/supPC8QDwQRM7Dns8',
  phone text not null default '+40 700 000 000',
  email text not null default 'contact@laograda.ro',
  instagram_url text not null default 'https://www.instagram.com/laograda/',
  facebook_url text not null default 'https://www.facebook.com/p/LaOgrada-100071189138778/',
  airbnb_url text not null default 'https://www.airbnb.com/rooms/44671053',
  booking_url text not null default 'https://www.booking.com/hotel/ro/laograda.ro.html',
  travelminit_url text not null default 'https://travelminit.ro/cabana-la-ograda-avrig',
  hero_title text not null default 'LaOgradă',
  cta_primary_text text not null default 'Verifică disponibilitate',
  cta_secondary_text text not null default 'Vezi galeria foto',
  amenities_title text not null default 'Facilități',
  amenities_subtitle text not null default '7 oaspeți · 3 dormitoare · 3 paturi · 2 băi — tot ce ai nevoie pentru o ședere confortabilă, indiferent de sezon.',
  gallery_title text not null default 'Galerie foto',
  booking_title text not null default 'Verifică disponibilitatea și rezervă',
  booking_subtitle text not null default 'Calendarul este sincronizat automat cu Booking.com, Airbnb și Travelminit — datele ocupate sunt blocate mai jos.',
  pricing_title text not null default 'Prețuri',
  pricing_subtitle text not null default 'Prețuri orientative — vor fi confirmate la trimiterea cererii de rezervare. Acceptăm și carduri de vacanță.',
  contact_title text not null default 'Contact',
  contact_subtitle text not null default 'Ai întrebări despre casă, acces sau facilități? Scrie-ne și îți răspundem cât mai curând.',
  price_normal numeric(10, 2) not null default 350,
  price_normal_label text not null default 'Sezon normal',
  price_normal_features text not null default '2 nopți minim
Curent, apă, Wi-Fi incluse
Anulare gratuită cu 7 zile înainte',
  price_weekend numeric(10, 2) not null default 450,
  price_weekend_label text not null default 'Weekend & sărbători',
  price_weekend_features text not null default '2 nopți minim
Curent, apă, Wi-Fi incluse
Foc de tabără & lemne incluse',
  price_long_stay numeric(10, 2) not null default 300,
  price_long_stay_label text not null default 'Sejur lung (5+ nopți)',
  price_long_stay_features text not null default 'Preț redus pentru șederi lungi
Curent, apă, Wi-Fi incluse
Curățenie inclusă',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- If the table already existed before these columns were added, backfill them:
alter table public.site_settings add column if not exists maps_url text not null default 'https://maps.app.goo.gl/supPC8QDwQRM7Dns8';
alter table public.site_settings add column if not exists instagram_url text not null default 'https://www.instagram.com/laograda/';
alter table public.site_settings add column if not exists facebook_url text not null default 'https://www.facebook.com/p/LaOgrada-100071189138778/';
alter table public.site_settings add column if not exists airbnb_url text not null default 'https://www.airbnb.com/rooms/44671053';
alter table public.site_settings add column if not exists booking_url text not null default 'https://www.booking.com/hotel/ro/laograda.ro.html';
alter table public.site_settings add column if not exists travelminit_url text not null default '';
alter table public.site_settings add column if not exists hero_title text not null default 'LaOgradă';
alter table public.site_settings add column if not exists cta_primary_text text not null default 'Verifică disponibilitate';
alter table public.site_settings add column if not exists cta_secondary_text text not null default 'Vezi galeria foto';
alter table public.site_settings add column if not exists amenities_title text not null default 'Facilități';
alter table public.site_settings add column if not exists amenities_subtitle text not null default '7 oaspeți · 3 dormitoare · 3 paturi · 2 băi — tot ce ai nevoie pentru o ședere confortabilă, indiferent de sezon.';
alter table public.site_settings add column if not exists gallery_title text not null default 'Galerie foto';
alter table public.site_settings add column if not exists booking_title text not null default 'Verifică disponibilitatea și rezervă';
alter table public.site_settings add column if not exists booking_subtitle text not null default 'Calendarul este sincronizat automat cu Booking.com, Airbnb și Travelminit — datele ocupate sunt blocate mai jos.';
alter table public.site_settings add column if not exists pricing_title text not null default 'Prețuri';
alter table public.site_settings add column if not exists pricing_subtitle text not null default 'Prețuri orientative — vor fi confirmate la trimiterea cererii de rezervare. Acceptăm și carduri de vacanță.';
alter table public.site_settings add column if not exists contact_title text not null default 'Contact';
alter table public.site_settings add column if not exists contact_subtitle text not null default 'Ai întrebări despre casă, acces sau facilități? Scrie-ne și îți răspundem cât mai curând.';
alter table public.site_settings add column if not exists price_normal_label text not null default 'Sezon normal';
alter table public.site_settings add column if not exists price_normal_features text not null default '2 nopți minim
Curent, apă, Wi-Fi incluse
Anulare gratuită cu 7 zile înainte';
alter table public.site_settings add column if not exists price_weekend_label text not null default 'Weekend & sărbători';
alter table public.site_settings add column if not exists price_weekend_features text not null default '2 nopți minim
Curent, apă, Wi-Fi incluse
Foc de tabără & lemne incluse';
alter table public.site_settings add column if not exists price_long_stay_label text not null default 'Sejur lung (5+ nopți)';
alter table public.site_settings add column if not exists price_long_stay_features text not null default 'Preț redus pentru șederi lungi
Curent, apă, Wi-Fi incluse
Curățenie inclusă';

-- `icon` is a key into the fixed icon registry in src/lib/amenity-icons.ts,
-- not a free-form value, so the admin panel can render a matching lucide icon.
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'sparkles',
  label text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- `storage_path` is the object path inside the public "gallery" Storage bucket.
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Audit log: who (email) did what (action) to which record, and when.
-- Written by src/lib/admin-audit.ts from every admin mutation route; read
-- by /admin/jurnal. Logging failures never block the actual admin action
-- (see logAdminAction()'s try/catch), so this table can be empty/missing
-- without breaking the rest of the admin panel.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.site_settings enable row level security;
alter table public.amenities enable row level security;
alter table public.gallery_images enable row level security;
alter table public.admin_audit_log enable row level security;

-- Public Storage bucket for gallery photos, managed from the admin panel.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- `drop ... if exists` first makes this script safe to re-run from scratch
-- (Postgres has no `create policy if not exists`).
drop policy if exists "Public read access for gallery photos" on storage.objects;
create policy "Public read access for gallery photos"
on storage.objects for select
using (bucket_id = 'gallery');

drop policy if exists "Authenticated users can upload gallery photos" on storage.objects;
create policy "Authenticated users can upload gallery photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery');

drop policy if exists "Authenticated users can delete gallery photos" on storage.objects;
create policy "Authenticated users can delete gallery photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery');

