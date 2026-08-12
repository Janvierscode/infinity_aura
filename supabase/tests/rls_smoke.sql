begin;

select plan(5);

select has_table('public', 'services', 'services table exists');
select has_table('public', 'contact_enquiries', 'enquiries table exists');
select has_function('public', 'is_app_admin', array[]::name[], 'admin authorization function exists');
select policies_are('public', 'services', array['MFA required for authenticated access', 'admin manages services', 'public reads published services'], 'services policies are explicit and require MFA');
select policies_are('public', 'contact_enquiries', array['MFA required for authenticated access', 'admin manages enquiries'], 'enquiries remain private and require MFA');

select * from finish();
rollback;
