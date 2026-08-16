-- Add a separately authored public preview before the application begins gating
-- full idea content. Access is hardened in the following migration so this
-- additive change can be deployed without breaking the current application.

alter table public.business_ideas
add column preview_markdown text;

update public.business_ideas
set preview_markdown = summary
where preview_markdown is null;

alter table public.business_ideas
alter column preview_markdown set not null;

alter table public.business_ideas
add constraint business_ideas_preview_markdown_length
check (char_length(preview_markdown) between 20 and 5000);

create or replace function private.set_business_idea_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if row(new.title, new.slug, new.summary, new.preview_markdown, new.body_markdown, new.category_id, new.cover_media_id, new.investment, new.launch_time, new.status, new.is_featured, new.meta_title, new.meta_description, new.published_at)
    is distinct from row(old.title, old.slug, old.summary, old.preview_markdown, old.body_markdown, old.category_id, old.cover_media_id, old.investment, old.launch_time, old.status, old.is_featured, old.meta_title, old.meta_description, old.published_at) then
    new.updated_at = now();
  end if;
  return new;
end;
$$;
