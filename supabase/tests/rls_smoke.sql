begin;

select plan(25);

select has_table('public', 'idea_categories', 'idea categories table exists');
select has_table('public', 'business_ideas', 'business ideas table exists');
select has_table('public', 'profiles', 'member profiles table exists');
select has_table('public', 'idea_comments', 'idea comments table exists');
select has_table('public', 'idea_votes', 'idea votes table exists');
select has_table('public', 'comment_votes', 'comment votes table exists');
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
select policies_are('public', 'services', array['MFA required for authenticated access', 'admin manages services', 'public reads published services'], 'service policies isolate unpublished content');
select policies_are('public', 'contact_enquiries', array['MFA required for authenticated access', 'admin manages enquiries'], 'leads remain private and require MFA');

select is(has_table_privilege('anon', 'public.contact_enquiries', 'select'), false, 'anonymous visitors cannot read leads');

select * from finish();
rollback;
