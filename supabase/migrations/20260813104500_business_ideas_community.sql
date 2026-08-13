-- Replace the editorial blog with a focused business-ideas community.

create type public.comment_status as enum ('visible', 'hidden');
create type public.investment_level as enum ('low', 'moderate', 'high');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idea_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) between 2 and 80),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 240),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  summary text not null check (char_length(summary) between 20 and 320),
  body_markdown text not null check (char_length(body_markdown) >= 20),
  category_id uuid not null references public.idea_categories(id) on delete restrict,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  investment public.investment_level not null default 'low',
  launch_time text check (launch_time is null or char_length(launch_time) <= 80),
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  upvote_count integer not null default 0 check (upvote_count >= 0),
  downvote_count integer not null default 0 check (downvote_count >= 0),
  vote_score integer not null default 0,
  comment_count integer not null default 0 check (comment_count >= 0),
  meta_title text check (meta_title is null or char_length(meta_title) <= 160),
  meta_description text check (meta_description is null or char_length(meta_description) <= 320),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.business_ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  status public.comment_status not null default 'visible',
  upvote_count integer not null default 0 check (upvote_count >= 0),
  downvote_count integer not null default 0 check (downvote_count >= 0),
  vote_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idea_votes (
  idea_id uuid not null references public.business_ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create table public.comment_votes (
  comment_id uuid not null references public.idea_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger set_idea_categories_updated_at before update on public.idea_categories for each row execute function private.set_updated_at();
create or replace function private.set_business_idea_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if row(new.title, new.slug, new.summary, new.body_markdown, new.category_id, new.cover_media_id, new.investment, new.launch_time, new.status, new.is_featured, new.meta_title, new.meta_description, new.published_at)
    is distinct from row(old.title, old.slug, old.summary, old.body_markdown, old.category_id, old.cover_media_id, old.investment, old.launch_time, old.status, old.is_featured, old.meta_title, old.meta_description, old.published_at) then
    new.updated_at = now();
  end if;
  return new;
end;
$$;
create trigger set_business_ideas_updated_at before update on public.business_ideas for each row execute function private.set_business_idea_updated_at();

create or replace function private.set_idea_comment_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if row(new.body, new.status) is distinct from row(old.body, old.status) then new.updated_at = now(); end if;
  return new;
end;
$$;
create trigger set_idea_comments_updated_at before update on public.idea_comments for each row execute function private.set_idea_comment_updated_at();
create trigger set_idea_votes_updated_at before update on public.idea_votes for each row execute function private.set_updated_at();
create trigger set_comment_votes_updated_at before update on public.comment_votes for each row execute function private.set_updated_at();

create or replace function private.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Member'), 80),
    case when coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture') ~ '^https://' then coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture') else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger create_user_profile
after insert on auth.users
for each row execute function private.create_user_profile();

insert into public.profiles (id, display_name, avatar_url)
select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), nullif(trim(raw_user_meta_data ->> 'full_name'), ''), split_part(email, '@', 1), 'Member'), 80),
  case when coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture') ~ '^https://' then coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture') else null end
from auth.users
on conflict (id) do nothing;

create or replace function private.recount_idea_votes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  target_id := case when tg_op = 'DELETE' then old.idea_id else new.idea_id end;
  update public.business_ideas idea set
    upvote_count = (select count(*) from public.idea_votes where idea_id = target_id and value = 1),
    downvote_count = (select count(*) from public.idea_votes where idea_id = target_id and value = -1),
    vote_score = (select coalesce(sum(value), 0) from public.idea_votes where idea_id = target_id)
  where idea.id = target_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.recount_comment_votes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  target_id := case when tg_op = 'DELETE' then old.comment_id else new.comment_id end;
  update public.idea_comments comment set
    upvote_count = (select count(*) from public.comment_votes where comment_id = target_id and value = 1),
    downvote_count = (select count(*) from public.comment_votes where comment_id = target_id and value = -1),
    vote_score = (select coalesce(sum(value), 0) from public.comment_votes where comment_id = target_id)
  where comment.id = target_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.recount_idea_comments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  target_id := case when tg_op = 'DELETE' then old.idea_id else new.idea_id end;
  update public.business_ideas idea set comment_count = (
    select count(*) from public.idea_comments where idea_id = target_id and status = 'visible'
  ) where idea.id = target_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger recount_idea_votes after insert or update or delete on public.idea_votes for each row execute function private.recount_idea_votes();
create trigger recount_comment_votes after insert or update or delete on public.comment_votes for each row execute function private.recount_comment_votes();
create trigger recount_idea_comments after insert or update or delete on public.idea_comments for each row execute function private.recount_idea_comments();

create index idea_categories_order_idx on public.idea_categories(sort_order, name);
create index business_ideas_category_idx on public.business_ideas(category_id);
create index business_ideas_cover_idx on public.business_ideas(cover_media_id);
create index business_ideas_updated_by_idx on public.business_ideas(updated_by);
create index business_ideas_published_idx on public.business_ideas(published_at desc) where status = 'published';
create index business_ideas_top_idx on public.business_ideas(vote_score desc, published_at desc) where status = 'published';
create index idea_comments_idea_idx on public.idea_comments(idea_id, created_at desc) where status = 'visible';
create index idea_comments_user_idx on public.idea_comments(user_id, created_at desc);
create index idea_votes_user_idx on public.idea_votes(user_id);
create index comment_votes_user_idx on public.comment_votes(user_id);

alter table public.profiles enable row level security;
alter table public.idea_categories enable row level security;
alter table public.business_ideas enable row level security;
alter table public.idea_comments enable row level security;
alter table public.idea_votes enable row level security;
alter table public.comment_votes enable row level security;

create policy "public reads profiles" on public.profiles for select to anon, authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "public reads idea categories" on public.idea_categories for select to anon, authenticated using (true);
create policy "admin manages idea categories" on public.idea_categories for all to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "public reads published ideas" on public.business_ideas for select to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now());
create policy "admin manages business ideas" on public.business_ideas for all to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "public reads visible comments" on public.idea_comments for select to anon, authenticated
using (status = 'visible' and exists (select 1 from public.business_ideas idea where idea.id = idea_comments.idea_id and idea.status = 'published' and idea.published_at <= now()));
create policy "users create own comments" on public.idea_comments for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'visible' and exists (select 1 from public.business_ideas idea where idea.id = idea_comments.idea_id and idea.status = 'published' and idea.published_at <= now()));
create policy "users update own visible comments" on public.idea_comments for update to authenticated
using (user_id = (select auth.uid()) and status = 'visible')
with check (user_id = (select auth.uid()) and status = 'visible');
create policy "users delete own comments" on public.idea_comments for delete to authenticated using (user_id = (select auth.uid()));
create policy "admin manages comments" on public.idea_comments for all to authenticated
using (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2')
with check (private.is_admin() and ((select auth.jwt()) ->> 'aal') = 'aal2');

create policy "users read own idea votes" on public.idea_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "users create own idea votes" on public.idea_votes for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.business_ideas idea where idea.id = idea_votes.idea_id and idea.status = 'published' and idea.published_at <= now()));
create policy "users update own idea votes" on public.idea_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and exists (select 1 from public.business_ideas idea where idea.id = idea_votes.idea_id and idea.status = 'published' and idea.published_at <= now()));
create policy "users delete own idea votes" on public.idea_votes for delete to authenticated using (user_id = (select auth.uid()));

create policy "users read own comment votes" on public.comment_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "users create own comment votes" on public.comment_votes for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.idea_comments comment join public.business_ideas idea on idea.id = comment.idea_id where comment.id = comment_votes.comment_id and comment.status = 'visible' and idea.status = 'published' and idea.published_at <= now()));
create policy "users update own comment votes" on public.comment_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and exists (select 1 from public.idea_comments comment join public.business_ideas idea on idea.id = comment.idea_id where comment.id = comment_votes.comment_id and comment.status = 'visible' and idea.status = 'published' and idea.published_at <= now()));
create policy "users delete own comment votes" on public.comment_votes for delete to authenticated using (user_id = (select auth.uid()));

grant select on public.profiles, public.idea_categories, public.business_ideas, public.idea_comments to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.idea_categories, public.business_ideas to authenticated;
grant insert (idea_id, user_id, body), update (body, status), delete on public.idea_comments to authenticated;
grant select, insert, update, delete on public.idea_votes, public.comment_votes to authenticated;

insert into public.idea_categories (name, slug, description, sort_order)
values
  ('Low-Cost Ideas', 'low-cost', 'Businesses that can begin with modest capital and practical skills.', 10),
  ('Technology', 'technology', 'Software, digital services, and technology-enabled opportunities.', 20),
  ('Agriculture', 'agriculture', 'Agriculture, food production, and value-chain opportunities.', 30),
  ('Professional Services', 'professional-services', 'Skill-based services for people and organizations.', 40),
  ('Retail & Commerce', 'retail-commerce', 'Product, distribution, and commerce opportunities.', 50),
  ('Creative Economy', 'creative-economy', 'Media, design, culture, and creative business opportunities.', 60)
on conflict (slug) do nothing;

-- Preserve any existing editorial content as ideas before retiring the blog model.
insert into public.idea_categories (name, slug, description, sort_order)
select name, slug, description, sort_order + 100 from public.blog_categories
on conflict (slug) do nothing;

insert into public.business_ideas (
  id, title, slug, summary, body_markdown, category_id, cover_media_id, status,
  is_featured, meta_title, meta_description, published_at, created_at, updated_at, updated_by
)
select post.id, post.title, post.slug, post.excerpt, post.body_markdown, category.id,
  post.cover_media_id, post.status, post.is_featured, post.meta_title,
  post.meta_description, post.published_at, post.created_at, post.updated_at, post.updated_by
from public.blog_posts post
join public.blog_categories old_category on old_category.id = post.category_id
join public.idea_categories category on category.slug = old_category.slug
on conflict (id) do nothing;

drop table public.blog_posts cascade;
drop table public.blog_categories cascade;
