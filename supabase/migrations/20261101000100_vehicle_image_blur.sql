-- A tiny blurred copy of each vehicle photo (a data URL of a few hundred bytes). The site shows it
-- instantly while the real photo loads, so a slow connection never leaves an empty box.
alter table public.vehicle_images add column blur_data_url text;
