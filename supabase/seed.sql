insert into public.site_settings (
  company_name, tagline, legal_name, public_email, enquiry_email, phone, city,
  country_code, website_url, default_meta_title, default_meta_description
)
values (
  'Infinity Aura Technologies', 'Innovate. Build. Empower.',
  'Infinity Aura Technologies', 'info@infinityaura.tech',
  'iyakaremyejanvier@gmail.com', '+263 716 524 607', 'Harare', 'ZW',
  'https://infinity-aura-technologies.vercel.app',
  'Infinity Aura Technologies | Innovate. Build. Empower.',
  'Reliable software, web platforms, mobile applications, and intelligent systems for ambitious organizations.'
)
on conflict (id) do update set
  company_name = excluded.company_name,
  tagline = excluded.tagline,
  public_email = excluded.public_email,
  enquiry_email = excluded.enquiry_email,
  phone = excluded.phone;

insert into public.services (
  slug, title, summary, body, icon_key, is_featured, status, sort_order, published_at
)
values
  ('custom-software-development', 'Custom Software Development', 'Purpose-built systems shaped around your workflows, people, and growth goals.', 'We design and engineer secure, maintainable software that turns complex operating needs into dependable digital products.', 'code-2', true, 'published', 10, now()),
  ('web-application-development', 'Web Application Development', 'Fast, accessible platforms built for users and engineered for measurable results.', 'From customer portals to internal platforms, we create responsive web applications with durable architecture and polished experiences.', 'panels-top-left', true, 'published', 20, now()),
  ('mobile-app-development', 'Mobile App Development', 'Intuitive mobile products that keep your services close to the people who need them.', 'We build practical mobile experiences that work across devices and connect cleanly to your wider digital ecosystem.', 'smartphone', true, 'published', 30, now()),
  ('school-management-systems', 'School Management Systems', 'Connected tools for admissions, academics, fees, communication, and reporting.', 'Give administrators, educators, parents, and students a clear, reliable platform for everyday school operations.', 'graduation-cap', true, 'published', 40, now()),
  ('business-automation', 'Business Automation Solutions', 'Streamlined processes that reduce repetitive work and improve operational visibility.', 'We map critical processes and replace avoidable manual effort with transparent, auditable workflows.', 'workflow', false, 'published', 50, now()),
  ('artificial-intelligence', 'Artificial Intelligence Solutions', 'Responsible AI tools that help teams understand information and make better decisions.', 'We apply intelligent automation, retrieval, and data-driven features where they create genuine business value.', 'brain-circuit', false, 'published', 60, now()),
  ('cloud-solutions', 'Cloud Solutions', 'Resilient infrastructure and deployment foundations designed to scale with confidence.', 'We help teams modernize hosting, delivery, storage, and monitoring without unnecessary complexity.', 'cloud', false, 'published', 70, now()),
  ('it-consulting', 'IT Consulting', 'Clear technical direction for organizations making consequential digital decisions.', 'We turn goals and constraints into practical roadmaps, architecture, and implementation priorities.', 'compass', false, 'published', 80, now())
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  icon_key = excluded.icon_key,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order;

insert into public.idea_categories (name, slug, description, sort_order)
values
  ('Low-Cost Ideas', 'low-cost', 'Businesses that can begin with modest capital and practical skills.', 10),
  ('Technology', 'technology', 'Software, digital services, and technology-enabled opportunities.', 20),
  ('Agriculture', 'agriculture', 'Agriculture, food production, and value-chain opportunities.', 30),
  ('Professional Services', 'professional-services', 'Skill-based services for people and organizations.', 40),
  ('Retail & Commerce', 'retail-commerce', 'Product, distribution, and commerce opportunities.', 50),
  ('Creative Economy', 'creative-economy', 'Media, design, culture, and creative business opportunities.', 60)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Local publishing fixtures use a real media record so development follows the
-- same cover-image requirement as production.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'seed-media@local.invalid', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Local seed"}'::jsonb,
  now(), now()
)
on conflict (id) do nothing;

insert into public.media_assets (
  id, bucket, object_path, public_url, original_filename, mime_type,
  size_bytes, width, height, alt_text, uploaded_by
)
values (
  '00000000-0000-0000-0000-000000000002', 'public-media',
  'seed/mobile-bookkeeping-cover.png', '/homepage.png', 'homepage.png',
  'image/png', 2257990, 3360, 2100,
  'Infinity Aura Technologies platform displayed on a desktop screen',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (id) do update set
  public_url = excluded.public_url,
  alt_text = excluded.alt_text;

insert into public.business_ideas (
  title, slug, summary, preview_markdown, body_markdown, category_id, cover_media_id, investment, launch_time,
  status, is_featured, published_at
)
select
  'Mobile Bookkeeping for Informal Traders',
  'mobile-bookkeeping-for-informal-traders',
  'Help small traders track daily sales, expenses, and stock through a simple mobile-first bookkeeping service.',
  '## Why this is worth exploring\n\nInformal traders often know cash is moving without knowing which products are profitable. This preview explains the customer, the starting offer, and what to validate before investing.',
  '## The opportunity\n\nMany informal traders know whether cash is moving, but not which products are profitable or where money is being lost. A lightweight bookkeeping service can turn daily records into useful decisions.\n\n## How to start\n\n1. Interview ten traders about how they currently record transactions.\n2. Create a simple mobile workflow using forms and spreadsheets.\n3. Charge a small monthly fee for setup, weekly summaries, and support.\n\n## What will matter\n\nTrust, simplicity, local language support, and consistent follow-up will matter more than sophisticated software at the beginning.',
  category.id,
  '00000000-0000-0000-0000-000000000002',
  'low',
  '2-4 weeks',
  'published',
  true,
  now()
from public.idea_categories category
where category.slug = 'low-cost'
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  preview_markdown = excluded.preview_markdown,
  body_markdown = excluded.body_markdown,
  category_id = excluded.category_id,
  cover_media_id = excluded.cover_media_id,
  investment = excluded.investment,
  launch_time = excluded.launch_time,
  status = excluded.status,
  is_featured = excluded.is_featured;
