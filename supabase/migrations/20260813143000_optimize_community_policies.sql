-- Consolidate overlapping community policies while preserving the same access boundaries.

drop policy "public reads published ideas" on public.business_ideas;
drop policy "admin manages business ideas" on public.business_ideas;

create policy "anonymous reads published ideas" on public.business_ideas
for select to anon
using (status = 'published' and published_at is not null and published_at <= now());

create policy "authenticated reads allowed ideas" on public.business_ideas
for select to authenticated
using (
  (status = 'published' and published_at is not null and published_at <= now())
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
);

create policy "admin inserts business ideas" on public.business_ideas
for insert to authenticated
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "admin updates business ideas" on public.business_ideas
for update to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "admin deletes business ideas" on public.business_ideas
for delete to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

drop policy "public reads idea categories" on public.idea_categories;
drop policy "admin manages idea categories" on public.idea_categories;

create policy "public reads idea categories" on public.idea_categories
for select to anon, authenticated using (true);

create policy "admin inserts idea categories" on public.idea_categories
for insert to authenticated
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "admin updates idea categories" on public.idea_categories
for update to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "admin deletes idea categories" on public.idea_categories
for delete to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

drop policy "public reads visible comments" on public.idea_comments;
drop policy "users create own comments" on public.idea_comments;
drop policy "users update own visible comments" on public.idea_comments;
drop policy "users delete own comments" on public.idea_comments;
drop policy "admin manages comments" on public.idea_comments;

create policy "anonymous reads visible comments" on public.idea_comments
for select to anon
using (
  status = 'visible'
  and exists (
    select 1 from public.business_ideas idea
    where idea.id = idea_comments.idea_id
      and idea.status = 'published'
      and idea.published_at <= now()
  )
);

create policy "authenticated reads allowed comments" on public.idea_comments
for select to authenticated
using (
  (
    status = 'visible'
    and exists (
      select 1 from public.business_ideas idea
      where idea.id = idea_comments.idea_id
        and idea.status = 'published'
        and idea.published_at <= now()
    )
  )
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
);

create policy "authenticated inserts allowed comments" on public.idea_comments
for insert to authenticated
with check (
  (
    user_id = (select auth.uid())
    and status = 'visible'
    and exists (
      select 1 from public.business_ideas idea
      where idea.id = idea_comments.idea_id
        and idea.status = 'published'
        and idea.published_at <= now()
    )
  )
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
);

create policy "authenticated updates allowed comments" on public.idea_comments
for update to authenticated
using (
  (user_id = (select auth.uid()) and status = 'visible')
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
)
with check (
  (user_id = (select auth.uid()) and status = 'visible')
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
);

create policy "authenticated deletes allowed comments" on public.idea_comments
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
);
