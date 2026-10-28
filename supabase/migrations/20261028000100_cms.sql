-- Ride Out — CMS (editable website text, images, lists and SEO)
-- Design: docs/08-cms.md. What is editable is defined in code (src/features/cms/registry.ts);
-- this schema only stores the values.

-- ---------------------------------------------------------------------------
-- Page content: one row per page ("home", "buy", "rent", "import", "sell", "about",
-- "contact", "policy", "global"). The whole page is one JSON document per locale, so a
-- publish is atomic and preview is just "read draft instead of published".
-- Shape: { "en": { "<section>": { "<field>": value, ... }, ... }, "fr": { ... } }
-- ---------------------------------------------------------------------------
create table public.content_pages (
  page text primary key check (page ~ '^[a-z][a-z0-9-]*$'),
  draft jsonb not null default '{}'::jsonb,
  published jsonb,
  has_unpublished_changes boolean generated always as (published is distinct from draft) stored,
  -- Optimistic locking: the editor sends the version it loaded; a save with a stale version fails.
  version int not null default 1,
  published_at timestamptz,
  published_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);
create trigger content_pages_updated_at before update on public.content_pages
  for each row execute function public.set_updated_at();

-- Every publish keeps a snapshot so admins can see history and roll back.
create table public.content_page_revisions (
  id uuid primary key default gen_random_uuid(),
  page text not null references public.content_pages (page) on delete cascade,
  content jsonb not null,
  published_by uuid references auth.users (id),
  published_at timestamptz not null default now()
);
create index content_page_revisions_page_idx on public.content_page_revisions (page, published_at desc);

-- Publish = copy draft to published + write a revision. Done in one function so it is atomic.
create or replace function public.publish_content_page(p_page text, p_expected_version int)
returns public.content_pages
language plpgsql security definer set search_path = public as $$
declare result public.content_pages;
begin
  if not public.is_admin() then
    raise exception 'Only admins can publish content';
  end if;

  update public.content_pages
     set published = draft,
         published_at = now(),
         published_by = auth.uid(),
         version = version + 1
   where page = p_page and version = p_expected_version
  returning * into result;

  if result.page is null then
    raise exception 'Content for "%" was changed by someone else. Reload and try again.', p_page;
  end if;

  insert into public.content_page_revisions (page, content, published_by)
  values (result.page, result.published, auth.uid());

  return result;
end;
$$;

-- Roll back = copy an old revision into the draft. The admin reviews it and publishes again.
create or replace function public.restore_content_revision(p_revision_id uuid)
returns public.content_pages
language plpgsql security definer set search_path = public as $$
declare result public.content_pages;
begin
  if not public.is_admin() then
    raise exception 'Only admins can restore content';
  end if;

  update public.content_pages p
     set draft = r.content,
         version = p.version + 1,
         updated_by = auth.uid()
    from public.content_page_revisions r
   where r.id = p_revision_id and p.page = r.page
  returning p.* into result;

  if result.page is null then
    raise exception 'Revision not found';
  end if;
  return result;
end;
$$;

-- The public site reads published content only, through this function, so drafts never leak.
-- content_pages itself stays admin-only. Returns null when the page has never been published
-- (the site then falls back to the defaults in the registry).
create or replace function public.get_published_content(p_page text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select published from public.content_pages where page = p_page;
$$;

-- ---------------------------------------------------------------------------
-- Media library (images used by the CMS). Files live in the public "site-media" bucket.
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_en text not null check (length(trim(alt_en)) > 0),
  alt_fr text,
  width int check (width > 0),
  height int check (height > 0),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 8 * 1024 * 1024),
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Homepage "featured cars" are chosen from inventory, not typed into the CMS.
-- ---------------------------------------------------------------------------
alter table public.vehicles
  add column is_featured boolean not null default false,
  add column featured_order int;
create index vehicles_featured_idx on public.vehicles (featured_order) where is_featured;

-- Footer social icons (Instagram and TikTok in the design). Phones, email and address already
-- live in business_settings, so the footer and contact page read them from there.
alter table public.business_settings
  add column instagram_url text,
  add column tiktok_url text;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.content_pages enable row level security;
alter table public.content_page_revisions enable row level security;
alter table public.media_assets enable row level security;

create policy "admins manage content_pages" on public.content_pages for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage content_page_revisions" on public.content_page_revisions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage media_assets" on public.media_assets for all
  using (public.is_admin()) with check (public.is_admin());
create policy "media metadata is public" on public.media_assets for select using (true);

revoke execute on function public.get_published_content(text) from public;
grant execute on function public.get_published_content(text) to anon, authenticated;

-- Seed one empty row per page; the app fills drafts from the Figma defaults on first run.
insert into public.content_pages (page) values
  ('global'), ('home'), ('buy'), ('rent'), ('import'), ('sell'), ('about'), ('contact'), ('policy');

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true);

create policy "admins manage site media" on storage.objects for all
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());
