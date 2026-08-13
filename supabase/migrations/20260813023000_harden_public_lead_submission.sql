-- The public contact form uses the anonymous role. Signed-in users do not need
-- this SECURITY DEFINER entry point because CRM writes use table policies.
revoke execute on function public.submit_contact_enquiry(text, text, text, text, text, text, text) from authenticated;
