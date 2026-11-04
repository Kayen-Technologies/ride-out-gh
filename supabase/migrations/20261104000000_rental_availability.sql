-- Which cars are already taken for a pair of dates, for the public /rent search.
-- Returns only vehicle ids (no customer data), so it is safe to let the public site call it.
-- Matches the no-overlap rule on rental_bookings: confirmed, ready-for-pickup and active bookings block a
-- car; enquiries, returned and cancelled bookings do not. The return date is exclusive.
create or replace function public.unavailable_rental_vehicle_ids(p_pickup date, p_return date)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct vehicle_id
  from public.rental_bookings
  where status in ('confirmed', 'ready_for_pickup', 'active')
    and daterange(pickup_date, return_date, '[)') && daterange(p_pickup, p_return, '[)');
$$;

revoke all on function public.unavailable_rental_vehicle_ids(date, date) from public;
grant execute on function public.unavailable_rental_vehicle_ids(date, date) to anon, authenticated;
