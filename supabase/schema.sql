-- =============================================================================
-- MIETEALLE — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- ── 1. PROFILES ───────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. One row per registered user.
create table if not exists public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  name                text        not null,
  email               text        not null,
  role                text        not null check (role in ('vendor', 'renter', 'admin')),
  company             text,
  phone               text,
  address             text,
  city                text,
  vat_id              text,
  verification_status text        not null default 'pending'
                                  check (verification_status in ('pending', 'verified', 'rejected')),
  govt_doc_type       text,
  govt_doc_number     text,
  govt_doc_url        text,        -- Supabase Storage path for uploaded KYC doc
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── 2. PRODUCTS ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid        primary key default gen_random_uuid(),
  vendor_id       uuid        not null references public.profiles(id) on delete cascade,
  title           text        not null,
  description     text,
  category        text,
  price_per_day   numeric     not null check (price_per_day > 0),
  min_rental_days int         not null default 1,
  location        text,
  images          text[]      default '{}',   -- Supabase Storage URLs
  status          text        not null default 'active'
                              check (status in ('active', 'inactive', 'pending')),
  available       boolean     not null default true,
  specifications  jsonb       not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ── 3. BOOKINGS ───────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),
  product_id    uuid        not null references public.products(id),
  renter_id     uuid        not null references public.profiles(id),
  vendor_id     uuid        not null references public.profiles(id),
  start_date    date        not null,
  end_date      date        not null,
  total_days    int         not null,
  total_amount  numeric     not null,
  status        text        not null default 'pending'
                            check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint valid_dates check (end_date >= start_date)
);

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.products  enable row level security;
alter table public.bookings  enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);   -- enforced via service-role key in API route

-- PRODUCTS policies
create policy "Anyone can read active products"
  on public.products for select
  using (status = 'active' or vendor_id = auth.uid() or public.is_admin());

create policy "Vendors can insert own products"
  on public.products for insert
  with check (vendor_id = auth.uid());

create policy "Vendors can update own products"
  on public.products for update
  using (vendor_id = auth.uid());

create policy "Admins can manage all products"
  on public.products for all
  using (public.is_admin());

-- BOOKINGS policies
create policy "Renters can read own bookings"
  on public.bookings for select
  using (renter_id = auth.uid());

create policy "Vendors can read bookings for their products"
  on public.bookings for select
  using (vendor_id = auth.uid());

create policy "Admins can read all bookings"
  on public.bookings for select
  using (public.is_admin());

create policy "Verified renters can create bookings"
  on public.bookings for insert
  with check (
    renter_id = auth.uid() and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and verification_status = 'verified'
    )
  );

create policy "Vendors can confirm/cancel bookings"
  on public.bookings for update
  using (vendor_id = auth.uid());

create policy "Admins can update all bookings"
  on public.bookings for update
  using (public.is_admin());

-- ── 5. STORAGE BUCKETS ────────────────────────────────────────────────────────
-- Run these separately in Storage section OR via this SQL:

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict do nothing;

-- Product images: anyone can read, authenticated vendors can upload
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Vendors can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- KYC docs: only uploader and admins can read
create policy "Uploader can read own KYC doc"
  on storage.objects for select
  using (bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins can read all KYC docs"
  on storage.objects for select
  using (bucket_id = 'kyc-documents' and public.is_admin());

create policy "Authenticated users can upload KYC doc"
  on storage.objects for insert
  with check (bucket_id = 'kyc-documents' and auth.role() = 'authenticated');

-- ── 6. GRANTS (fixes "permission denied" for service_role) ───────────────────
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables    in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

-- ── 7. SEED: ADMIN USER ───────────────────────────────────────────────────────
-- After running this schema, create the admin user via:
--   Supabase Dashboard → Authentication → Users → Add User
--   Email: admin@mietealle.de  Password: admin123
-- Then run this to set their profile:
--
-- insert into public.profiles (id, name, email, role, company, verification_status)
-- values (
--   '<paste the UUID from the user you just created>',
--   'Admin User', 'admin@mietealle.de', 'admin', 'Mietealle GmbH', 'verified'
-- );

-- =============================================================================
-- DONE. Tables created: profiles, products, bookings
-- Buckets created: product-images (public), kyc-documents (private)
-- =============================================================================
