-- Ride Out — initial schema
-- Source of truth for fields: Figma file dmoIAsFN5cXluPaEzqWPzC (Website page 1:4, Dashboard page 120:530).
-- Values marked "PROPOSED" are not visible in the design yet; confirm with the client (see docs/07-open-questions.md).

create extension if not exists pgcrypto;
-- uuid equality inside the rental overlap constraint
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin', 'super_admin');

create type public.listing_purpose as enum ('sale', 'rent');
create type public.listing_status as enum ('draft', 'published', 'hidden');
-- Locked (Q9): available, booked, rented, under_maintenance, unavailable, plus sold for sale listings.
create type public.availability_status as enum ('available', 'booked', 'rented', 'sold', 'under_maintenance', 'unavailable');

create type public.vehicle_condition as enum ('brand_new', 'used');
create type public.condition_preference as enum ('brand_new', 'used', 'either');
create type public.body_type as enum ('suv', 'sedan', 'hatchback', 'pickup', 'other');
create type public.transmission as enum ('automatic', 'manual');
create type public.transmission_preference as enum ('automatic', 'manual', 'no_preference');
create type public.fuel_type as enum ('petrol', 'diesel', 'hybrid', 'electric');
create type public.fuel_preference as enum ('petrol', 'diesel', 'hybrid', 'electric', 'no_preference');
create type public.budget_covers as enum ('purchase_only', 'purchase_and_import', 'not_sure');

-- Website step 1 of the import form + "I'm Interested" on a listed car.
create type public.order_service_type as enum ('find_and_purchase', 'import_found_car', 'listing_purchase');

-- Import pipeline includes customs_clearance (Q2, locked). Listing-purchase statuses are separate.
-- A check constraint rejects mixing the two. cancelled is locked (Q12).
create type public.order_status as enum (
  'enquiry', 'reviewing', 'confirmed', 'sourcing', 'purchased', 'in_transit', 'customs_clearance', 'delivered',
  'inquiry_received', 'availability_confirmed', 'purchase_arrangements', 'vehicle_handover',
  'cancelled'
);

-- Rental pipeline (130:18484). cancelled is locked (Q12) and does not block dates.
create type public.rental_status as enum ('inquiry_received', 'confirmed', 'ready_for_pickup', 'active', 'returned', 'cancelled');
-- Q11, locked: with_driver exists and has no extra price column.
create type public.driver_option as enum ('self_drive', 'with_driver');

create type public.submission_status as enum ('new', 'in_review', 'closed');

-- ---------------------------------------------------------------------------
-- Reference codes (VEH-001, CUS-1001, RO-1042, RB-2041 as shown in the design)
-- ---------------------------------------------------------------------------
create sequence public.vehicle_code_seq start 1;
create sequence public.customer_code_seq start 1001;
create sequence public.order_code_seq start 1001;
create sequence public.rental_code_seq start 2001;
create sequence public.sell_code_seq start 1001;

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role public.user_role not null default 'customer',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
-- One account per email. Phone is not an identity.
create unique index profiles_email_unique on public.profiles (lower(email)) where email is not null;

-- Admin check used by every RLS policy. security definer so it can read profiles under RLS.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- Create a profile row whenever someone signs up (email/password or Google),
-- then attach any guest customer row that already uses that email.
-- Phone is never used to merge people.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  normalized_email text := lower(trim(new.email));
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    normalized_email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );

  if normalized_email is not null then
    update public.customers
    set user_id = new.id
    where user_id is null
      and email = normalized_email;
  end if;

  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Customers (CRM record). Guests who submit a form get a customer row with user_id = null.
-- Email is required and unique. A later sign-up with that email links the row
-- (see handle_new_user). A customer created after the account already exists
-- is linked here. Phone is contact information only.
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CUS-' || nextval('public.customer_code_seq')),
  user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  location text,
  acquisition_source text not null default 'website',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_email_shape check (
    email = lower(email)
    and email !~ '[[:space:]]'
    and email ~ '^[^@]+@[^@]+\.[^@]+$'
  )
);
create unique index customers_email_unique on public.customers (email);
create index customers_phone_idx on public.customers (phone);
create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

create or replace function public.normalize_and_link_customer() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  matched uuid;
begin
  new.email = lower(trim(new.email));

  if new.user_id is null then
    select id into matched
    from auth.users
    where lower(email) = new.email
    limit 1;
    if matched is not null then
      new.user_id = matched;
    end if;
  end if;

  return new;
end;
$$;
create trigger customers_normalize_and_link
  before insert or update of email, user_id on public.customers
  for each row execute function public.normalize_and_link_customer();

-- ---------------------------------------------------------------------------
-- Vehicles (inventory for sale and for rent)
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('VEH-' || lpad(nextval('public.vehicle_code_seq')::text, 3, '0')),
  slug text not null unique,
  listing_purpose public.listing_purpose not null,
  listing_status public.listing_status not null default 'draft',
  availability_status public.availability_status not null default 'available',

  brand text not null,
  model text not null,
  trim text,
  year int not null check (year between 1950 and 2100),
  condition public.vehicle_condition not null,
  body_type public.body_type,
  transmission public.transmission,
  fuel_type public.fuel_type,
  exterior_colour text,
  mileage_km int check (mileage_km >= 0),
  seats int check (seats > 0),
  registration text,
  location text,
  description text,
  seller_name text not null default 'Ride-Out',

  -- "Vehicle Condition" card on the car detail page (1:3568)
  condition_grade text,
  accident_history text,
  inspection_status text,

  -- Ride Out's own prices are cedis.
  sale_price numeric(12, 2) check (sale_price >= 0),
  rental_daily_rate numeric(12, 2) check (rental_daily_rate >= 0),
  rental_security_deposit numeric(12, 2) check (rental_security_deposit >= 0),

  published_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vehicles_price_matches_purpose check (
    listing_status = 'draft'
    or (listing_purpose = 'sale' and sale_price is not null)
    or (listing_purpose = 'rent' and rental_daily_rate is not null)
  )
);
create index vehicles_public_idx on public.vehicles (listing_purpose, listing_status, availability_status);
create index vehicles_brand_model_idx on public.vehicles (lower(brand), lower(model));
create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index vehicle_images_vehicle_idx on public.vehicle_images (vehicle_id, sort_order);
create unique index vehicle_images_one_cover on public.vehicle_images (vehicle_id) where is_cover;

create table public.saved_vehicles (
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

-- ---------------------------------------------------------------------------
-- Vehicle orders: "Help me find and purchase a car", "Import a car I've found",
-- and "I'm Interested" on a Ride Out listing.
-- ---------------------------------------------------------------------------
create table public.vehicle_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('RO-' || nextval('public.order_code_seq')),
  customer_id uuid not null references public.customers (id) on delete restrict,
  service_type public.order_service_type not null,
  status public.order_status not null,
  vehicle_id uuid references public.vehicles (id) on delete set null,

  -- What the customer asked for (import form steps 1–2)
  requested_brand text,
  requested_model text,
  requested_year_range text,
  condition_preference public.condition_preference,
  budget_amount numeric(12, 2) check (budget_amount >= 0),
  -- The currency the customer picked. Independent of Ride Out's cedis prices.
  budget_currency char(3) not null default 'GHS' check (budget_currency ~ '^[A-Z]{3}$'),
  budget_covers public.budget_covers,
  transmission_preference public.transmission_preference,
  fuel_preference public.fuel_preference,
  customer_notes text,
  policy_accepted_at timestamptz,

  -- Filled in by admins
  vehicle_title text,
  vehicle_origin text,
  estimated_price numeric(12, 2) check (estimated_price >= 0),
  -- Staff quotes stay in cedis, even when the customer's budget is in another currency.
  estimated_price_currency char(3) not null default 'GHS' check (estimated_price_currency = 'GHS'),
  estimated_arrival_date date,
  latest_update_title text,
  latest_update_body text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vehicle_orders_listing_has_vehicle check (service_type <> 'listing_purchase' or vehicle_id is not null),
  constraint vehicle_orders_status_matches_service check (
    (
      service_type in ('find_and_purchase', 'import_found_car')
      and status in (
        'enquiry', 'reviewing', 'confirmed', 'sourcing', 'purchased',
        'in_transit', 'customs_clearance', 'delivered', 'cancelled'
      )
    )
    or (
      service_type = 'listing_purchase'
      and status in (
        'inquiry_received', 'availability_confirmed', 'purchase_arrangements',
        'vehicle_handover', 'cancelled'
      )
    )
  )
);
create index vehicle_orders_status_idx on public.vehicle_orders (status, created_at desc);
create index vehicle_orders_customer_idx on public.vehicle_orders (customer_id);
create trigger vehicle_orders_updated_at before update on public.vehicle_orders
  for each row execute function public.set_updated_at();

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vehicle_orders (id) on delete cascade,
  status public.order_status not null,
  changed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Rental bookings ("Request this car" modal 1:4829, admin 120:6469)
-- ---------------------------------------------------------------------------
create table public.rental_bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('RB-' || nextval('public.rental_code_seq')),
  customer_id uuid not null references public.customers (id) on delete restrict,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  status public.rental_status not null default 'inquiry_received',

  pickup_date date not null,
  return_date date not null,
  pickup_location text,
  driver_option public.driver_option not null default 'self_drive',

  -- Rates are copied from the vehicle at booking time so later price edits don't change old bookings.
  daily_rate numeric(12, 2) not null check (daily_rate >= 0),
  security_deposit numeric(12, 2) not null default 0 check (security_deposit >= 0),
  rental_days int generated always as (return_date - pickup_date) stored,
  estimated_subtotal numeric(12, 2) generated always as (daily_rate * (return_date - pickup_date)) stored,

  -- Ghana Card: private storage only, never exposed through a public URL.
  ghana_card_number text,
  ghana_card_image_path text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint rental_bookings_dates check (return_date > pickup_date),
  -- Return date is exclusive, matching rental_days = return_date - pickup_date.
  -- Enquiries, returned bookings, and cancellations do not block the car.
  constraint rental_bookings_no_overlap exclude using gist (
    vehicle_id with =,
    daterange(pickup_date, return_date, '[)') with &&
  ) where (status in ('confirmed', 'ready_for_pickup', 'active'))
);
create index rental_bookings_status_idx on public.rental_bookings (status, pickup_date);
create index rental_bookings_vehicle_idx on public.rental_bookings (vehicle_id, pickup_date, return_date);
create index rental_bookings_customer_idx on public.rental_bookings (customer_id);
create trigger rental_bookings_updated_at before update on public.rental_bookings
  for each row execute function public.set_updated_at();

create table public.rental_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.rental_bookings (id) on delete cascade,
  status public.rental_status not null,
  changed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index rental_status_history_booking_idx on public.rental_status_history (booking_id, created_at);

-- ---------------------------------------------------------------------------
-- "Sell your car" submissions (1:3891 → 1:4128). No dashboard screen exists yet — see open questions.
-- ---------------------------------------------------------------------------
create table public.sell_submissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('SL-' || nextval('public.sell_code_seq')),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status public.submission_status not null default 'new',
  brand text,
  model text,
  year int check (year between 1950 and 2100),
  mileage_km int check (mileage_km >= 0),
  transmission public.transmission,
  fuel_type public.fuel_type,
  condition text,
  exterior_colour text,
  asking_price numeric(12, 2) check (asking_price >= 0),
  price_flexibility text,
  minimum_price numeric(12, 2) check (minimum_price >= 0),
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) <= 9),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger sell_submissions_updated_at before update on public.sell_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Contact form (1:5103). No dashboard screen exists yet — see open questions.
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  message text,
  status public.submission_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Internal notes (order 120:5252, booking 120:6469). Exactly one parent per note.
-- ---------------------------------------------------------------------------
create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.vehicle_orders (id) on delete cascade,
  booking_id uuid references public.rental_bookings (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  body text not null,
  author_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  constraint internal_notes_one_parent check (num_nonnulls(order_id, booking_id, customer_id) = 1)
);

-- ---------------------------------------------------------------------------
-- Settings (120:7603). Single-row business settings + per-admin notification choices.
-- ---------------------------------------------------------------------------
create table public.business_settings (
  id boolean primary key default true check (id),
  business_name text not null default 'Ride Out',
  email text,
  phones text[] not null default '{}',
  address text,
  default_rental_security_deposit numeric(12, 2),
  default_pickup_location text,
  updated_at timestamptz not null default now()
);
insert into public.business_settings (id) values (true);
create trigger business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

create table public.notification_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  event text not null,
  email_enabled boolean not null default true,
  primary key (user_id, event)
);

-- ---------------------------------------------------------------------------
-- Status history triggers
-- ---------------------------------------------------------------------------
create or replace function public.log_order_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by) values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;
create trigger vehicle_orders_status_log after insert or update of status on public.vehicle_orders
  for each row execute function public.log_order_status();

create or replace function public.log_rental_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.rental_status_history (booking_id, status, changed_by) values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;
create trigger rental_bookings_status_log after insert or update of status on public.rental_bookings
  for each row execute function public.log_rental_status();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public forms insert through server actions with the service-role key (after zod validation
-- and rate limiting), so there are no anonymous insert policies here.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.saved_vehicles enable row level security;
alter table public.vehicle_orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.rental_bookings enable row level security;
alter table public.rental_status_history enable row level security;
alter table public.sell_submissions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.internal_notes enable row level security;
alter table public.business_settings enable row level security;
alter table public.notification_preferences enable row level security;

-- Admins can do everything on every table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'customers', 'vehicles', 'vehicle_images', 'saved_vehicles', 'vehicle_orders',
    'order_status_history', 'rental_bookings', 'rental_status_history', 'sell_submissions',
    'contact_messages', 'internal_notes', 'business_settings', 'notification_preferences'
  ] loop
    execute format('create policy "admins manage %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Profiles: users read and update their own row, but cannot change their role.
create policy "own profile read" on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid());

-- Only admins can change a role. Checked in a trigger because a policy that reads profiles
-- from inside a profiles policy would recurse.
create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;
create trigger profiles_protect_role before update of role on public.profiles
  for each row execute function public.protect_profile_role();

-- Public catalogue
create policy "published vehicles are public" on public.vehicles for select
  using (listing_status = 'published');
create policy "images of published vehicles are public" on public.vehicle_images for select
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.listing_status = 'published'));
create policy "business settings are public" on public.business_settings for select using (true);

-- Saved vehicles
create policy "own saved vehicles" on public.saved_vehicles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Customers see their own records and requests (profile "My Requests" 130:18045).
create policy "own customer record" on public.customers for select using (user_id = auth.uid());
create policy "own vehicle orders" on public.vehicle_orders for select
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own order history" on public.order_status_history for select
  using (exists (
    select 1 from public.vehicle_orders o join public.customers c on c.id = o.customer_id
    where o.id = order_id and c.user_id = auth.uid()
  ));
create policy "own rental bookings" on public.rental_bookings for select
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own rental history" on public.rental_status_history for select
  using (exists (
    select 1 from public.rental_bookings b join public.customers c on c.id = b.customer_id
    where b.id = booking_id and c.user_id = auth.uid()
  ));
create policy "own sell submissions" on public.sell_submissions for select
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own notification preferences" on public.notification_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Customers must never see internal notes, ID card numbers through other routes, or contact messages:
-- no customer policies exist on internal_notes or contact_messages.

-- ---------------------------------------------------------------------------
-- Storage buckets
-- vehicle-images: public read (catalogue photos).
-- sell-photos, id-documents: private; admins read through short-lived signed URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('vehicle-images', 'vehicle-images', true),
  ('sell-photos', 'sell-photos', false),
  ('id-documents', 'id-documents', false);

create policy "admins manage vehicle images" on storage.objects for all
  using (bucket_id = 'vehicle-images' and public.is_admin())
  with check (bucket_id = 'vehicle-images' and public.is_admin());
create policy "admins read private uploads" on storage.objects for select
  using (bucket_id in ('sell-photos', 'id-documents') and public.is_admin());
