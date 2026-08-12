insert into public.site_settings (company_name, tagline, legal_name, public_email, enquiry_email, phone, city, country_code, website_url, default_meta_title, default_meta_description)
values ('Infinity Aura Technologies', 'Innovate. Build. Empower.', 'Infinity Aura Technologies', 'info@infinityaura.tech', 'iyakaremyejanvier@gmail.com', '+263 716 524 607', 'Harare', 'ZW', 'https://www.infinityaura.tech', 'Infinity Aura Technologies | Innovate. Build. Empower.', 'Building innovative digital solutions for tomorrow.')
on conflict (id) do update set company_name = excluded.company_name, tagline = excluded.tagline, public_email = excluded.public_email, enquiry_email = excluded.enquiry_email, phone = excluded.phone;

insert into public.services (slug, title, summary, body, icon_key, is_featured, status, sort_order, published_at) values
('custom-software-development', 'Custom Software Development', 'Purpose-built systems shaped around your workflows, people, and growth goals.', 'We design and engineer secure, maintainable software that turns complex operating needs into dependable digital products.', 'code-2', true, 'published', 10, now()),
('web-application-development', 'Web Application Development', 'Fast, accessible platforms built for users and engineered for measurable results.', 'From customer portals to internal platforms, we create responsive web applications with durable architecture and polished experiences.', 'panels-top-left', true, 'published', 20, now()),
('mobile-app-development', 'Mobile App Development', 'Intuitive mobile products that keep your services close to the people who need them.', 'We build practical mobile experiences that work across devices and connect cleanly to your wider digital ecosystem.', 'smartphone', true, 'published', 30, now()),
('school-management-systems', 'School Management Systems', 'Connected tools for admissions, academics, fees, communication, and reporting.', 'Give administrators, educators, parents, and students a clear, reliable platform for everyday school operations.', 'graduation-cap', true, 'published', 40, now()),
('business-automation', 'Business Automation Solutions', 'Streamlined processes that reduce repetitive work and improve operational visibility.', 'We map critical processes and replace avoidable manual effort with transparent, auditable workflows.', 'workflow', true, 'published', 50, now()),
('artificial-intelligence', 'Artificial Intelligence Solutions', 'Responsible AI tools that help teams understand information and make better decisions.', 'We apply intelligent automation, retrieval, and data-driven features where they create genuine business value.', 'brain-circuit', true, 'published', 60, now()),
('cloud-solutions', 'Cloud Solutions', 'Resilient infrastructure and deployment foundations designed to scale with confidence.', 'We help teams modernize hosting, delivery, storage, and monitoring without unnecessary complexity.', 'cloud', false, 'published', 70, now()),
('it-consulting', 'IT Consulting', 'Clear technical direction for organizations making consequential digital decisions.', 'We turn goals and constraints into practical roadmaps, architecture, and implementation priorities.', 'compass', false, 'published', 80, now())
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, body = excluded.body, icon_key = excluded.icon_key, sort_order = excluded.sort_order;

insert into public.solutions (slug, title, category, summary, body, benefits, is_featured, status, sort_order, published_at) values
('school-management-system', 'School Management System', 'Education', 'One clear operating platform for modern schools.', 'Bring enrolment, student records, academic reporting, fees, attendance, and communication into one secure workspace.', '["Unified student records", "Clear fee visibility", "Faster reporting"]', true, 'published', 10, now()),
('inventory-management-system', 'Inventory Management System', 'Operations', 'Know what you have, where it is, and what needs attention.', 'Track stock movement, supplier activity, reorder signals, and operational trends from a responsive business dashboard.', '["Live stock position", "Actionable alerts", "Reliable audit trail"]', true, 'published', 20, now()),
('business-management-platform', 'Business Management Platform', 'Business', 'Connected operations without fragmented spreadsheets.', 'Combine customers, projects, finance workflows, documents, and reporting in a platform tailored to your organization.', '["Shared operational view", "Automated workflows", "Scalable permissions"]', true, 'published', 30, now()),
('ai-powered-solutions', 'AI-Powered Solutions', 'Intelligence', 'Practical intelligence embedded in the work your team already does.', 'Use secure assistants, document intelligence, automation, and analytics to increase capacity and improve decisions.', '["Faster information access", "Responsible automation", "Human-centered controls"]', true, 'published', 40, now())
on conflict (slug) do update set title = excluded.title, category = excluded.category, summary = excluded.summary, body = excluded.body, benefits = excluded.benefits, sort_order = excluded.sort_order;

insert into public.technology_categories (name, slug, sort_order) values
('Frontend', 'frontend', 10), ('Backend', 'backend', 20), ('Data', 'data', 30), ('Delivery', 'delivery', 40)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.technologies (category_id, name, short_mark, sort_order)
select category.id, item.name, item.short_mark, item.sort_order
from public.technology_categories category
join (values
  ('frontend', 'HTML5', 'H5', 10), ('frontend', 'CSS3', 'C3', 20), ('frontend', 'JavaScript', 'JS', 30), ('frontend', 'Next.js', 'N', 40),
  ('backend', 'TypeScript', 'TS', 10), ('backend', 'Python', 'PY', 20), ('backend', 'Django', 'DJ', 30), ('backend', 'Node.js', 'ND', 40),
  ('data', 'PostgreSQL', 'PG', 10), ('data', 'MySQL', 'MY', 20), ('data', 'Supabase', 'SB', 30), ('data', 'Artificial Intelligence', 'AI', 40),
  ('delivery', 'Git', 'GT', 10), ('delivery', 'GitHub', 'GH', 20), ('delivery', 'Docker', 'DK', 30), ('delivery', 'Vercel', 'VC', 40)
) as item(category_slug, name, short_mark, sort_order) on item.category_slug = category.slug
on conflict (category_id, name) do update set short_mark = excluded.short_mark, sort_order = excluded.sort_order;

insert into public.pages (slug, name, status, meta_title, meta_description, robots_index, published_at) values
('home', 'Homepage', 'published', 'Infinity Aura Technologies | Innovate. Build. Empower.', 'Building innovative digital solutions for tomorrow.', true, now()),
('about', 'About', 'published', 'About Infinity Aura Technologies', 'Learn about our mission, vision, and approach to building digital systems for African progress.', true, now()),
('contact', 'Contact', 'published', 'Contact Infinity Aura Technologies', 'Start a software, web, mobile, automation, or AI project with Infinity Aura Technologies.', true, now())
on conflict (slug) do update set name = excluded.name, meta_title = excluded.meta_title, meta_description = excluded.meta_description;

insert into public.page_sections (page_id, section_key, section_type, eyebrow, heading, accent_text, body, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, sort_order)
select page.id, section.section_key, section.section_type::public.section_type, section.eyebrow, section.heading, section.accent_text, section.body, section.primary_cta_label, section.primary_cta_url, section.secondary_cta_label, section.secondary_cta_url, section.sort_order
from public.pages page
join (values
  ('home', 'hero', 'hero', 'Digital innovation, engineered in Zimbabwe', 'Building innovative digital solutions', 'for tomorrow.', 'We help ambitious organizations transform ideas into powerful software, web platforms, mobile applications, and intelligent digital solutions.', 'Start your project', '/contact', 'Explore our work', '/services', 10),
  ('home', 'about', 'rich_text', 'Who we are', 'Technology with purpose.', 'Impact by design.', 'Infinity Aura Technologies is a forward-thinking technology company creating reliable digital products that help organizations grow, operate efficiently, and serve people better.', 'Discover our company', '/about', null, null, 20),
  ('home', 'services', 'services', 'What we build', 'Expertise that moves', 'your business forward.', 'From first strategy to dependable delivery, we engineer technology around real operating needs.', null, null, null, null, 30),
  ('home', 'solutions', 'solutions', 'Featured solutions', 'Platforms designed for', 'real-world momentum.', null, null, null, null, null, 40),
  ('home', 'technologies', 'technologies', 'Our toolkit', 'Modern foundations.', 'Practical choices.', 'We select proven technologies based on product needs, long-term ownership, security, and performance.', null, null, null, null, 50),
  ('home', 'cta', 'cta', 'Let''s build what''s next', 'Your next digital advantage can start with one conversation.', null, null, 'Start a project', '/contact', null, null, 60)
) as section(page_slug, section_key, section_type, eyebrow, heading, accent_text, body, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, sort_order) on section.page_slug = page.slug
on conflict (page_id, section_key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading, accent_text = excluded.accent_text, body = excluded.body, primary_cta_label = excluded.primary_cta_label, primary_cta_url = excluded.primary_cta_url, secondary_cta_label = excluded.secondary_cta_label, secondary_cta_url = excluded.secondary_cta_url, sort_order = excluded.sort_order;

insert into public.navigation_items (location, label, url, sort_order)
select item.location::public.navigation_location, item.label, item.url, item.sort_order
from (values
  ('header', 'Home', '/', 10), ('header', 'About', '/about', 20), ('header', 'Services', '/services', 30), ('header', 'Solutions', '/solutions', 40), ('header', 'Contact', '/contact', 50),
  ('footer_primary', 'About', '/about', 10), ('footer_primary', 'Services', '/services', 20), ('footer_primary', 'Solutions', '/solutions', 30), ('footer_primary', 'Contact', '/contact', 40),
  ('footer_services', 'Custom software', '/services/custom-software-development', 10), ('footer_services', 'Web applications', '/services/web-application-development', 20), ('footer_services', 'AI solutions', '/services/artificial-intelligence', 30),
  ('legal', 'Privacy', '/privacy', 10), ('legal', 'Terms', '/terms', 20)
) as item(location, label, url, sort_order)
where not exists (
  select 1 from public.navigation_items existing
  where existing.location = item.location::public.navigation_location
    and existing.label = item.label
    and existing.url = item.url
);

insert into public.social_links (platform, label, url, icon_key, sort_order)
select item.platform, item.label, item.url, item.icon_key, item.sort_order
from (values
  ('linkedin', 'LinkedIn', 'https://linkedin.com/company/infinity-aura-technologies', 'linkedin', 10),
  ('facebook', 'Facebook', '#', 'facebook', 20),
  ('github', 'GitHub', '#', 'github', 30)
) as item(platform, label, url, icon_key, sort_order)
where not exists (
  select 1 from public.social_links existing
  where existing.platform = item.platform and existing.url = item.url
);
