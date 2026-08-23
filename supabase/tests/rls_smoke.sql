begin;

select plan(33);

select has_table('public', 'idea_categories', 'idea categories table exists');
select has_table('public', 'business_ideas', 'business ideas table exists');
select has_table('public', 'profiles', 'member profiles table exists');
select has_table('public', 'idea_comments', 'idea comments table exists');
select has_table('public', 'idea_votes', 'idea votes table exists');
select has_table('public', 'comment_votes', 'comment votes table exists');
select has_column('public', 'business_ideas', 'preview_markdown', 'business ideas have a public preview');
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.business_ideas'::regclass
      and conname = 'business_ideas_published_cover_check'
      and contype = 'c'
  ),
  'published business ideas require a cover image'
);
select has_table('public', 'services', 'services table remains');
select has_table('public', 'contact_enquiries', 'leads table remains private');
select has_function('public', 'submit_contact_enquiry', array['text', 'text', 'text', 'text', 'text', 'text', 'text'], 'public lead submission function exists');

select hasnt_table('public', 'blog_categories', 'blog categories are retired');
select hasnt_table('public', 'blog_posts', 'blog posts are retired');
select hasnt_table('public', 'solutions', 'solutions table is retired');
select hasnt_table('public', 'pages', 'pages table is retired');
select hasnt_table('public', 'technologies', 'technologies table is retired');
select hasnt_table('public', 'testimonials', 'testimonials table is retired');
select hasnt_table('public', 'navigation_items', 'dynamic navigation is retired');
select hasnt_table('public', 'content_revisions', 'content revisions are retired');
select hasnt_table('public', 'audit_logs', 'activity logs are retired');

select policies_are('public', 'business_ideas', array['admin deletes business ideas', 'admin inserts business ideas', 'admin updates business ideas', 'anonymous reads published ideas', 'authenticated reads allowed ideas'], 'idea policies isolate drafts and require MFA for admin work');
select policies_are('public', 'idea_categories', array['admin deletes idea categories', 'admin inserts idea categories', 'admin updates idea categories', 'public reads idea categories'], 'idea category policies are explicit');
select policies_are('public', 'idea_votes', array['users create own idea votes', 'users delete own idea votes', 'users read own idea votes', 'users update own idea votes'], 'idea votes are private and owner-controlled');
select policies_are('public', 'comment_votes', array['users create own comment votes', 'users delete own comment votes', 'users read own comment votes', 'users update own comment votes'], 'comment votes are private and owner-controlled');
select policies_are('public', 'idea_comments', array['authenticated deletes allowed comments', 'authenticated inserts allowed comments', 'authenticated reads allowed comments', 'authenticated updates allowed comments'], 'idea comments are member-only and owner-controlled');
select policies_are('public', 'profiles', array['authenticated reads member profiles', 'users update own profile'], 'member profiles are not public');
select policies_are('public', 'services', array['MFA required for authenticated access', 'admin manages services', 'public reads published services'], 'service policies isolate unpublished content');
select policies_are('public', 'contact_enquiries', array['MFA required for authenticated access', 'admin manages enquiries'], 'leads remain private and require MFA');

select is(has_table_privilege('anon', 'public.contact_enquiries', 'select'), false, 'anonymous visitors cannot read leads');
select is(has_column_privilege('anon', 'public.business_ideas', 'preview_markdown', 'select'), true, 'anonymous visitors can read idea previews');
select is(has_column_privilege('anon', 'public.business_ideas', 'body_markdown', 'select'), false, 'anonymous visitors cannot read complete idea bodies');
select is(has_table_privilege('anon', 'public.idea_comments', 'select'), false, 'anonymous visitors cannot read comments');
select is(has_table_privilege('anon', 'public.profiles', 'select'), false, 'anonymous visitors cannot read member profiles');

select * from finish();
rollback;
