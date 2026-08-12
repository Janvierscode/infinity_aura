-- Defense in depth for the private singleton authorization table. The
-- SECURITY DEFINER helper remains the only supported read path.
alter table private.app_admin enable row level security;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_admin(); $$;

-- Public website reads always use the anonymous client. Authenticated access is
-- reserved for the sole administrator, avoiding duplicate permissive policies.
alter policy "public reads settings" on public.site_settings to anon;
alter policy "public reads published pages" on public.pages to anon;
alter policy "public reads visible published sections" on public.page_sections to anon;
alter policy "public reads published services" on public.services to anon;
alter policy "public reads published solutions" on public.solutions to anon;
alter policy "public reads visible statistics" on public.stat_items to anon;
alter policy "public reads visible technology categories" on public.technology_categories to anon;
alter policy "public reads visible technologies" on public.technologies to anon;
alter policy "public reads approved testimonials" on public.testimonials to anon;
alter policy "public reads visible navigation" on public.navigation_items to anon;
alter policy "public reads visible social links" on public.social_links to anon;
alter policy "public reads media metadata" on public.media_assets to anon;
alter policy "public reads public media objects" on storage.objects to anon;

-- Evaluate the JWT once per statement instead of once per row.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'media_assets', 'site_settings', 'pages', 'page_sections', 'services',
    'solutions', 'stat_items', 'technology_categories', 'technologies',
    'testimonials', 'navigation_items', 'social_links', 'contact_enquiries',
    'content_revisions', 'audit_logs'
  ] loop
    execute format('drop policy "MFA required for authenticated access" on public.%I', table_name);
    execute format(
      'create policy "MFA required for authenticated access" on public.%I as restrictive for all to authenticated using (((select auth.jwt()) ->> ''aal'') = ''aal2'') with check (((select auth.jwt()) ->> ''aal'') = ''aal2'')',
      table_name
    );
  end loop;
end $$;

drop policy "admin uploads public media objects" on storage.objects;
drop policy "admin updates public media objects" on storage.objects;
drop policy "admin deletes public media objects" on storage.objects;

create policy "admin uploads public media objects"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'public-media'
  and private.is_admin()
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
);

create policy "admin updates public media objects"
on storage.objects for update to authenticated
using (
  bucket_id = 'public-media'
  and private.is_admin()
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
)
with check (
  bucket_id = 'public-media'
  and private.is_admin()
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
);

create policy "admin deletes public media objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'public-media'
  and private.is_admin()
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
);

-- Cover foreign keys used during referenced-row updates and deletes.
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index contact_enquiries_service_id_idx on public.contact_enquiries(service_id);
create index content_revisions_created_by_idx on public.content_revisions(created_by);
create index media_assets_uploaded_by_idx on public.media_assets(uploaded_by);
create index navigation_items_parent_id_idx on public.navigation_items(parent_id);
create index page_sections_media_id_idx on public.page_sections(media_id);
create index page_sections_updated_by_idx on public.page_sections(updated_by);
create index pages_og_media_id_idx on public.pages(og_media_id);
create index pages_updated_by_idx on public.pages(updated_by);
create index services_hero_media_id_idx on public.services(hero_media_id);
create index services_updated_by_idx on public.services(updated_by);
create index site_settings_default_og_media_id_idx on public.site_settings(default_og_media_id);
create index site_settings_icon_media_id_idx on public.site_settings(icon_media_id);
create index site_settings_logo_media_id_idx on public.site_settings(logo_media_id);
create index site_settings_updated_by_idx on public.site_settings(updated_by);
create index solutions_hero_media_id_idx on public.solutions(hero_media_id);
create index solutions_updated_by_idx on public.solutions(updated_by);
create index technologies_logo_media_id_idx on public.technologies(logo_media_id);
create index testimonials_avatar_media_id_idx on public.testimonials(avatar_media_id);
create index testimonials_updated_by_idx on public.testimonials(updated_by);
