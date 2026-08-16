-- Restrict anonymous visitors to the explicitly public idea projection. The
-- full Markdown body and discussion are available only to signed-in members.

revoke select on public.business_ideas from anon;
grant select (
  id,
  title,
  slug,
  summary,
  preview_markdown,
  category_id,
  cover_media_id,
  investment,
  launch_time,
  status,
  is_featured,
  upvote_count,
  downvote_count,
  vote_score,
  comment_count,
  meta_title,
  meta_description,
  published_at,
  created_at,
  updated_at
) on public.business_ideas to anon;

drop policy "anonymous reads visible comments" on public.idea_comments;
revoke select on public.idea_comments from anon;

drop policy "public reads profiles" on public.profiles;
create policy "authenticated reads member profiles" on public.profiles
for select to authenticated
using (true);
revoke select on public.profiles from anon;
