-- =============================================================================
-- MIETEALLE — Schema v2 Migration
-- Run in Supabase Dashboard → SQL Editor after schema.sql
-- =============================================================================

-- ── PROFILES: vendor commission rate ─────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS notes          text;

-- ── PRODUCTS: transport, insurance, quantity ──────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS transport_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS transport_cost      numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_required  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS quantity            integer DEFAULT 1;

-- ── BOOKINGS: extended tracking & booking options ────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS delivery_address      text,
  ADD COLUMN IF NOT EXISTS transport_option      text DEFAULT 'self_pickup'
                                                 CHECK (transport_option IN ('vendor','self_pickup')),
  ADD COLUMN IF NOT EXISTS transport_cost        numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_selected    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_cost        numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate       numeric DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS pre_payment_amount    numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tracking_status       text DEFAULT 'pending'
                                                 CHECK (tracking_status IN (
                                                   'pending','confirmed','packaging',
                                                   'in_transit','delivered','completed',
                                                   'return_initiated','return_in_transit',
                                                   'returned','closed','cancelled')),
  ADD COLUMN IF NOT EXISTS vendor_notes          text,
  ADD COLUMN IF NOT EXISTS renter_notes          text,
  ADD COLUMN IF NOT EXISTS dispatch_deadline     timestamptz,
  ADD COLUMN IF NOT EXISTS dispatched_at         timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at          timestamptz,
  ADD COLUMN IF NOT EXISTS return_initiated_at   timestamptz,
  ADD COLUMN IF NOT EXISTS return_in_transit_at  timestamptz,
  ADD COLUMN IF NOT EXISTS returned_at           timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at             timestamptz,
  ADD COLUMN IF NOT EXISTS grand_total           numeric GENERATED ALWAYS AS
                                                 (total_amount + transport_cost + insurance_cost)
                                                 STORED;

-- ── BOOKING_MEDIA: quality check photos/videos ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_media (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  uploaded_by uuid        NOT NULL REFERENCES public.profiles(id),
  role        text        NOT NULL CHECK (role IN ('vendor','renter','admin')),
  media_type  text        NOT NULL CHECK (media_type IN (
                            'pre_dispatch','post_receive','damage','return_dispatch','return_receive')),
  url         text        NOT NULL,
  caption     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own booking media"
  ON public.booking_media FOR SELECT
  USING (uploaded_by = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own media"
  ON public.booking_media FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ── RATINGS: star ratings by renter ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid    UNIQUE NOT NULL REFERENCES public.bookings(id),
  product_id  uuid    NOT NULL REFERENCES public.products(id),
  vendor_id   uuid    NOT NULL REFERENCES public.profiles(id),
  renter_id   uuid    NOT NULL REFERENCES public.profiles(id),
  stars       integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ratings"   ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Renters can insert rating" ON public.ratings FOR INSERT WITH CHECK (renter_id = auth.uid());

-- ── BOOKING AUDIT LOG ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_audit (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  actor_id    uuid        REFERENCES public.profiles(id),
  action      text        NOT NULL,
  old_status  text,
  new_status  text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read all audit" ON public.booking_audit FOR SELECT USING (public.is_admin());
CREATE POLICY "Users read own audit"  ON public.booking_audit FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.renter_id = auth.uid() OR b.vendor_id = auth.uid())));

-- ── GRANTS ───────────────────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON public.booking_media TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON public.ratings       TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON public.booking_audit TO postgres, anon, authenticated, service_role;

-- =============================================================================
-- DONE. New tables: booking_media, ratings, booking_audit
-- New columns on bookings, products, profiles
-- =============================================================================
