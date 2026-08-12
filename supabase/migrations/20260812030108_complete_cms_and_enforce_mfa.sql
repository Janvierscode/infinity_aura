-- The CMS requires a second authentication factor for every authenticated data
-- operation. Public anonymous reads remain governed by the existing policies.
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
    execute format(
      'create policy "MFA required for authenticated access" on public.%I as restrictive for all to authenticated using (((select auth.jwt()) ->> ''aal'') = ''aal2'') with check (((select auth.jwt()) ->> ''aal'') = ''aal2'')',
      table_name
    );
  end loop;
end $$;

-- Storage write policies also enforce AAL2. Public reads remain available.
drop policy if exists "admin uploads public media objects" on storage.objects;
drop policy if exists "admin updates public media objects" on storage.objects;
drop policy if exists "admin deletes public media objects" on storage.objects;

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
