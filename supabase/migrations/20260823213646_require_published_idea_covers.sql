alter table public.business_ideas
  add constraint business_ideas_published_cover_check
  check (status <> 'published'::public.content_status or cover_media_id is not null)
  not valid;

alter table public.business_ideas
  validate constraint business_ideas_published_cover_check;
