-- Checks the rules locked before the first database push.
-- Identity is email only. Statuses cannot cross pipelines.
-- Confirmed, ready-for-pickup, and active rentals cannot overlap.
-- Staff estimates stay in GHS. Customer budgets keep their own currency.

create or replace function public.assert_true(cond boolean, message text) returns void
language plpgsql as $$
begin
  if cond is not true then
    raise exception 'FAIL: %', message;
  end if;
end;
$$;

insert into public.customers (full_name, email, phone)
values ('Guest', 'Guest@Example.com', '0570786961');

select public.assert_true(
  (select email from public.customers where full_name = 'Guest') = 'guest@example.com',
  'guest email was not stored in lowercase'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  'Guest@Example.com',
  '{"full_name":"Guest Person"}'::jsonb
);

select public.assert_true(
  (select user_id::text from public.customers where email = 'guest@example.com')
    = '11111111-1111-1111-1111-111111111111',
  'sign-up did not link the guest customer'
);

select public.assert_true(
  (select full_name from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'Guest Person',
  'profile name was not copied from sign-up'
);

-- Same phone, different email: these are two people.
insert into public.customers (full_name, email, phone)
values ('Other', 'other@example.com', '0570786961');

do $$
begin
  insert into public.customers (full_name, email) values ('Dup', 'guest@example.com');
  raise exception 'FAIL: duplicate email was allowed';
exception
  when unique_violation then
    null;
end $$;

do $$
begin
  insert into public.customers (full_name, email) values ('Blank', '   ');
  raise exception 'FAIL: blank email was allowed';
exception
  when check_violation then
    null;
end $$;

insert into auth.users (id, email, raw_user_meta_data)
values (
  '22222222-2222-2222-2222-222222222222',
  'later@example.com',
  '{"full_name":"Later"}'::jsonb
);

insert into public.customers (full_name, email)
values ('Later', 'Later@Example.com');

select public.assert_true(
  (select user_id::text from public.customers where email = 'later@example.com')
    = '22222222-2222-2222-2222-222222222222',
  'customer created after the account was not linked'
);

insert into public.vehicles (slug, listing_purpose, brand, model, year, condition, listing_status, sale_price)
values ('sale-car', 'sale', 'Toyota', 'Corolla', 2020, 'used', 'published', 100000);

insert into public.vehicles (slug, listing_purpose, brand, model, year, condition, listing_status, rental_daily_rate)
values
  ('rent-a', 'rent', 'Toyota', 'Hilux', 2021, 'used', 'published', 650),
  ('rent-b', 'rent', 'Toyota', 'Raize', 2022, 'used', 'published', 400),
  ('rent-c', 'rent', 'Toyota', 'Vitz', 2019, 'used', 'published', 300);

do $$
declare
  cid uuid;
  vid uuid;
begin
  select id into cid from public.customers where email = 'guest@example.com';
  select id into vid from public.vehicles where slug = 'sale-car';

  begin
    insert into public.vehicle_orders (customer_id, service_type, status, requested_brand)
    values (cid, 'find_and_purchase', 'inquiry_received', 'Toyota');
    raise exception 'FAIL: import order accepted a listing status';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into public.vehicle_orders (customer_id, service_type, status, vehicle_id)
    values (cid, 'listing_purchase', 'enquiry', vid);
    raise exception 'FAIL: listing order accepted an import status';
  exception
    when check_violation then
      null;
  end;

  insert into public.vehicle_orders (
    customer_id, service_type, status, requested_brand, budget_amount, budget_currency
  ) values (cid, 'find_and_purchase', 'enquiry', 'Toyota', 20000, 'USD');

  begin
    insert into public.vehicle_orders (
      customer_id, service_type, status, estimated_price, estimated_price_currency
    ) values (cid, 'find_and_purchase', 'enquiry', 150000, 'USD');
    raise exception 'FAIL: staff estimate accepted USD';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into public.vehicle_orders (customer_id, service_type, status, budget_currency)
    values (cid, 'find_and_purchase', 'enquiry', 'usd');
    raise exception 'FAIL: lowercase budget currency was accepted';
  exception
    when check_violation then
      null;
  end;
end $$;

do $$
declare
  cid uuid;
  va uuid;
  vb uuid;
  vc uuid;
begin
  select id into cid from public.customers where email = 'guest@example.com';
  select id into va from public.vehicles where slug = 'rent-a';
  select id into vb from public.vehicles where slug = 'rent-b';
  select id into vc from public.vehicles where slug = 'rent-c';

  insert into public.rental_bookings (customer_id, vehicle_id, status, pickup_date, return_date, daily_rate)
  values
    (cid, va, 'inquiry_received', '2026-10-21', '2026-10-24', 650),
    (cid, va, 'inquiry_received', '2026-10-21', '2026-10-24', 650);

  insert into public.rental_bookings (customer_id, vehicle_id, status, pickup_date, return_date, daily_rate)
  values
    (cid, vb, 'confirmed', '2026-10-21', '2026-10-24', 400),
    (cid, vb, 'confirmed', '2026-10-24', '2026-10-27', 400);

  if (select rental_days from public.rental_bookings where vehicle_id = vb and pickup_date = '2026-10-21') <> 3 then
    raise exception 'FAIL: 21-24 Oct should be 3 rental days';
  end if;

  insert into public.rental_bookings (customer_id, vehicle_id, status, pickup_date, return_date, daily_rate)
  values (cid, vc, 'confirmed', '2026-10-21', '2026-10-24', 300);

  begin
    insert into public.rental_bookings (customer_id, vehicle_id, status, pickup_date, return_date, daily_rate)
    values (cid, vc, 'ready_for_pickup', '2026-10-23', '2026-10-26', 300);
    raise exception 'FAIL: overlapping ready-for-pickup booking was allowed';
  exception
    when exclusion_violation then
      null;
  end;

  insert into public.rental_bookings (customer_id, vehicle_id, status, pickup_date, return_date, daily_rate)
  values
    (cid, vc, 'returned', '2026-11-01', '2026-11-04', 300),
    (cid, vc, 'confirmed', '2026-11-01', '2026-11-04', 300),
    (cid, vc, 'cancelled', '2026-11-01', '2026-11-04', 300);
end $$;
