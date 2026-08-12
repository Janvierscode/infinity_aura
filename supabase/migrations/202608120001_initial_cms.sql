create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.enquiry_status as enum ('new', 'read', 'in_progress', 'replied', 'closed', 'spam');
create type public.notification_status as enum ('pending', 'sent', 'failed');
create type public.navigation_location as enum ('header', 'footer_primary', 'footer_services', 'legal');
create type public.section_type as enum ('hero', 'rich_text', 'purpose', 'services', 'statistics', 'solutions', 'technologies', 'testimonials', 'contact', 'cta');

create table private.app_admin (
  singleton boolean primary key default true check (singleton),
  user_id uuid unique not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.app_admin where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'public-media',
  object_path text unique not null,
  public_url text not null,
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  caption text,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  company_name text not null,
  tagline text not null,
  legal_name text,
  public_email text not null,
  enquiry_email text not null,
  phone text,
  address_line text,
  city text,
  country_code char(2),
  timezone text not null default 'Africa/Harare',
  website_url text,
  default_meta_title text,
  default_meta_description text,
  default_og_media_id uuid references public.media_assets(id) on delete set null,
  logo_media_id uuid references public.media_assets(id) on delete set null,
  icon_media_id uuid references public.media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status public.content_status not null default 'draft',
  meta_title text,
  meta_description text,
  canonical_url text,
  og_media_id uuid references public.media_assets(id) on delete set null,
  robots_index boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  section_type public.section_type not null,
  eyebrow text,
  heading text,
  accent_text text,
  body text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  media_id uuid references public.media_assets(id) on delete set null,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (page_id, section_key)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  summary text not null check (char_length(summary) between 10 and 300),
  body text not null check (char_length(body) >= 20),
  icon_key text,
  hero_media_id uuid references public.media_assets(id) on delete set null,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0 check (sort_order >= 0),
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.solutions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  category text,
  summary text not null check (char_length(summary) between 10 and 300),
  body text not null check (char_length(body) >= 20),
  challenge text,
  approach text,
  benefits jsonb not null default '[]'::jsonb check (jsonb_typeof(benefits) = 'array'),
  hero_media_id uuid references public.media_assets(id) on delete set null,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0 check (sort_order >= 0),
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.stat_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.page_sections(id) on delete cascade,
  label text not null,
  value numeric not null,
  prefix text,
  suffix text,
  description text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true
);

create table public.technology_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.technology_categories(id) on delete cascade,
  name text not null,
  short_mark text,
  logo_media_id uuid references public.media_assets(id) on delete set null,
  website_url text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true,
  unique (category_id, name)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (char_length(quote) between 20 and 1000),
  person_name text not null,
  person_role text,
  organization text,
  avatar_media_id uuid references public.media_assets(id) on delete set null,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  location public.navigation_location not null,
  label text not null,
  url text not null,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  open_in_new_tab boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  icon_key text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_visible boolean not null default true
);

create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 160),
  phone text,
  organization text,
  service_id uuid references public.services(id) on delete set null,
  subject text,
  message text not null check (char_length(message) between 10 and 5000),
  status public.enquiry_status not null default 'new',
  source_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notification_status public.notification_status not null default 'pending',
  internal_note text,
  read_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function private.assign_enquiry_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.reference_number is null then
    new.reference_number := 'IAT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  revision_number integer not null check (revision_number > 0),
  snapshot jsonb not null,
  change_summary text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, revision_number)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function private.set_updated_at();
create trigger set_pages_updated_at before update on public.pages for each row execute function private.set_updated_at();
create trigger set_page_sections_updated_at before update on public.page_sections for each row execute function private.set_updated_at();
create trigger set_services_updated_at before update on public.services for each row execute function private.set_updated_at();
create trigger set_solutions_updated_at before update on public.solutions for each row execute function private.set_updated_at();
create trigger set_testimonials_updated_at before update on public.testimonials for each row execute function private.set_updated_at();
create trigger assign_enquiry_reference before insert on public.contact_enquiries for each row execute function private.assign_enquiry_reference();

create index services_published_idx on public.services(sort_order) where status = 'published';
create index solutions_published_idx on public.solutions(sort_order) where status = 'published';
create index page_sections_page_order_idx on public.page_sections(page_id, sort_order);
create index stat_items_section_order_idx on public.stat_items(section_id, sort_order);
create index technologies_category_order_idx on public.technologies(category_id, sort_order);
create index navigation_location_order_idx on public.navigation_items(location, sort_order);
create index enquiries_status_created_idx on public.contact_enquiries(status, created_at desc);
create index enquiries_email_idx on public.contact_enquiries(lower(email));
create index revisions_entity_idx on public.content_revisions(entity_type, entity_id, revision_number desc);
create index audit_created_idx on public.audit_logs(created_at desc);

alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.services enable row level security;
alter table public.solutions enable row level security;
alter table public.stat_items enable row level security;
alter table public.technology_categories enable row level security;
alter table public.technologies enable row level security;
alter table public.testimonials enable row level security;
alter table public.navigation_items enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.content_revisions enable row level security;
alter table public.audit_logs enable row level security;

create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public reads published pages" on public.pages for select to anon, authenticated using (status = 'published' and (published_at is null or published_at <= now()) and robots_index);
create policy "public reads visible published sections" on public.page_sections for select to anon, authenticated using (is_visible and exists (select 1 from public.pages p where p.id = page_id and p.status = 'published'));
create policy "public reads published services" on public.services for select to anon, authenticated using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public reads published solutions" on public.solutions for select to anon, authenticated using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public reads visible statistics" on public.stat_items for select to anon, authenticated using (is_visible);
create policy "public reads visible technology categories" on public.technology_categories for select to anon, authenticated using (is_visible);
create policy "public reads visible technologies" on public.technologies for select to anon, authenticated using (is_visible);
create policy "public reads approved testimonials" on public.testimonials for select to anon, authenticated using (is_approved and published_at is not null and published_at <= now());
create policy "public reads visible navigation" on public.navigation_items for select to anon, authenticated using (is_visible);
create policy "public reads visible social links" on public.social_links for select to anon, authenticated using (is_visible);
create policy "public reads media metadata" on public.media_assets for select to anon, authenticated using (bucket = 'public-media');

create policy "admin manages media" on public.media_assets for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages settings" on public.site_settings for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages pages" on public.pages for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages sections" on public.page_sections for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages services" on public.services for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages solutions" on public.solutions for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages statistics" on public.stat_items for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages technology categories" on public.technology_categories for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages technologies" on public.technologies for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages testimonials" on public.testimonials for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages navigation" on public.navigation_items for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages social links" on public.social_links for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin manages enquiries" on public.contact_enquiries for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin reads revisions" on public.content_revisions for select to authenticated using (private.is_admin());
create policy "admin creates revisions" on public.content_revisions for insert to authenticated with check (private.is_admin() and created_by = (select auth.uid()));
create policy "admin reads audit logs" on public.audit_logs for select to authenticated using (private.is_admin());
create policy "admin creates audit logs" on public.audit_logs for insert to authenticated with check (private.is_admin() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-media', 'public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads public media objects" on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy "admin uploads public media objects" on storage.objects for insert to authenticated with check (bucket_id = 'public-media' and private.is_admin());
create policy "admin updates public media objects" on storage.objects for update to authenticated using (bucket_id = 'public-media' and private.is_admin()) with check (bucket_id = 'public-media' and private.is_admin());
create policy "admin deletes public media objects" on storage.objects for delete to authenticated using (bucket_id = 'public-media' and private.is_admin());

grant select on public.site_settings, public.pages, public.page_sections, public.services, public.solutions, public.stat_items, public.technology_categories, public.technologies, public.testimonials, public.navigation_items, public.social_links, public.media_assets to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
