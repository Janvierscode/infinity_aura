-- Phase 3 replaces the general-purpose CMS with a focused publishing and lead platform.

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) between 2 and 80),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 240),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(excerpt) between 20 and 320),
  body_markdown text not null check (char_length(body_markdown) >= 20),
  category_id uuid not null references public.blog_categories(id) on delete restrict,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  meta_title text check (meta_title is null or char_length(meta_title) <= 160),
  meta_description text check (meta_description is null or char_length(meta_description) <= 320),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create trigger set_blog_categories_updated_at
before update on public.blog_categories
for each row execute function private.set_updated_at();

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function private.set_updated_at();

create index blog_categories_order_idx on public.blog_categories(sort_order, name);
create index blog_posts_category_id_idx on public.blog_posts(category_id);
create index blog_posts_cover_media_id_idx on public.blog_posts(cover_media_id);
create index blog_posts_updated_by_idx on public.blog_posts(updated_by);
create index blog_posts_published_idx on public.blog_posts(published_at desc)
where status = 'published';

alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

create policy "public reads blog categories"
on public.blog_categories for select to anon using (true);

create policy "public reads published blog posts"
on public.blog_posts for select to anon
using (status = 'published' and published_at is not null and published_at <= now());

create policy "admin manages blog categories"
on public.blog_categories for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "admin manages blog posts"
on public.blog_posts for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "MFA required for authenticated access"
on public.blog_categories as restrictive for all to authenticated
using (((select auth.jwt()) ->> 'aal') = 'aal2')
with check (((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "MFA required for authenticated access"
on public.blog_posts as restrictive for all to authenticated
using (((select auth.jwt()) ->> 'aal') = 'aal2')
with check (((select auth.jwt()) ->> 'aal') = 'aal2');

-- Anonymous users can submit a validated lead but cannot access the CRM table.
create or replace function public.submit_contact_enquiry(
  p_name text,
  p_email text,
  p_phone text default null,
  p_organization text default null,
  p_subject text default null,
  p_message text default null,
  p_source_path text default null
)
returns table (id uuid, reference_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.contact_enquiries;
begin
  if char_length(trim(p_name)) not between 2 and 100 then
    raise exception 'Invalid name';
  end if;
  if char_length(trim(p_email)) > 160 or trim(p_email) !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Invalid email';
  end if;
  if p_message is null or char_length(trim(p_message)) not between 10 and 5000 then
    raise exception 'Invalid message';
  end if;

  insert into public.contact_enquiries (name, email, phone, organization, subject, message, source_path)
  values (
    trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''),
    nullif(trim(p_organization), ''), nullif(trim(p_subject), ''),
    trim(p_message), nullif(trim(p_source_path), '')
  )
  returning * into created;

  return query select created.id, created.reference_number;
end;
$$;

revoke all on function public.submit_contact_enquiry(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_contact_enquiry(text, text, text, text, text, text, text) to anon;

-- Remove SVG from the retained media system.
alter table public.media_assets drop constraint if exists media_assets_mime_type_check;
alter table public.media_assets add constraint media_assets_mime_type_check
check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif'));

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'public-media';

-- Restrict anonymous metadata reads to fields needed to render public images.
revoke all on public.media_assets from anon;
grant select (id, public_url, alt_text, width, height) on public.media_assets to anon;

revoke all on public.site_settings from anon;
grant select (
  id, company_name, tagline, legal_name, public_email, phone, address_line, city,
  country_code, timezone, website_url, default_meta_title, default_meta_description,
  default_og_media_id, logo_media_id, icon_media_id, created_at, updated_at
) on public.site_settings to anon;

grant select on public.blog_categories, public.blog_posts to anon;
grant select, insert, update, delete on public.blog_categories, public.blog_posts to authenticated;

insert into public.blog_categories (name, slug, description, sort_order)
values
  ('Technology', 'technology', 'Practical perspectives on software, platforms, and emerging technology.', 10),
  ('Artificial Intelligence', 'artificial-intelligence', 'Responsible and useful applications of artificial intelligence.', 20),
  ('Digital Transformation', 'digital-transformation', 'Guidance for organizations improving how they work through technology.', 30),
  ('Business', 'business', 'Technology strategy, operations, and sustainable business growth.', 40)
on conflict (slug) do nothing;

-- Retire the Phase 2 general-purpose content systems after the verified export.
drop table public.stat_items cascade;
drop table public.page_sections cascade;
drop table public.pages cascade;
drop table public.solutions cascade;
drop table public.technologies cascade;
drop table public.technology_categories cascade;
drop table public.testimonials cascade;
drop table public.navigation_items cascade;
drop table public.social_links cascade;
drop table public.content_revisions cascade;
drop table public.audit_logs cascade;

drop type public.navigation_location;
drop type public.section_type;
