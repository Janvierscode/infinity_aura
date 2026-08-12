import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { NavigationItemRow, PageSectionRow, ServiceRow, SiteSettingsRow, SocialLinkRow, SolutionRow, TechnologyCategoryRow, TechnologyRow, TestimonialRow } from "@/types/database";

type MarketingItem = Pick<
  ServiceRow,
  "id" | "slug" | "title" | "summary" | "body" | "icon_key" | "is_featured" | "sort_order"
>;

export const fallbackServices: MarketingItem[] = [
  { id: "service-1", slug: "custom-software-development", title: "Custom Software Development", summary: "Purpose-built systems shaped around your workflows, people, and growth goals.", body: "We design and engineer secure, maintainable software that turns complex operating needs into dependable digital products.", icon_key: "code-2", is_featured: true, sort_order: 10 },
  { id: "service-2", slug: "web-application-development", title: "Web Application Development", summary: "Fast, accessible platforms built for users and engineered for measurable results.", body: "From customer portals to internal platforms, we create responsive web applications with durable architecture and polished experiences.", icon_key: "panels-top-left", is_featured: true, sort_order: 20 },
  { id: "service-3", slug: "mobile-app-development", title: "Mobile App Development", summary: "Intuitive mobile products that keep your services close to the people who need them.", body: "We build practical mobile experiences that work across devices and connect cleanly to your wider digital ecosystem.", icon_key: "smartphone", is_featured: true, sort_order: 30 },
  { id: "service-4", slug: "school-management-systems", title: "School Management Systems", summary: "Connected tools for admissions, academics, fees, communication, and reporting.", body: "Give administrators, educators, parents, and students a clear, reliable platform for everyday school operations.", icon_key: "graduation-cap", is_featured: true, sort_order: 40 },
  { id: "service-5", slug: "business-automation", title: "Business Automation Solutions", summary: "Streamlined processes that reduce repetitive work and improve operational visibility.", body: "We map critical processes and replace avoidable manual effort with transparent, auditable workflows.", icon_key: "workflow", is_featured: true, sort_order: 50 },
  { id: "service-6", slug: "artificial-intelligence", title: "Artificial Intelligence Solutions", summary: "Responsible AI tools that help teams understand information and make better decisions.", body: "We apply intelligent automation, retrieval, and data-driven features where they create genuine business value.", icon_key: "brain-circuit", is_featured: true, sort_order: 60 },
  { id: "service-7", slug: "cloud-solutions", title: "Cloud Solutions", summary: "Resilient infrastructure and deployment foundations designed to scale with confidence.", body: "We help teams modernize hosting, delivery, storage, and monitoring without unnecessary complexity.", icon_key: "cloud", is_featured: false, sort_order: 70 },
  { id: "service-8", slug: "it-consulting", title: "IT Consulting", summary: "Clear technical direction for organizations making consequential digital decisions.", body: "We turn goals and constraints into practical roadmaps, architecture, and implementation priorities.", icon_key: "compass", is_featured: false, sort_order: 80 },
];

export const fallbackSolutions: Array<Pick<SolutionRow, "id" | "slug" | "title" | "category" | "summary" | "body" | "benefits" | "is_featured" | "sort_order">> = [
  { id: "solution-1", slug: "school-management-system", title: "School Management System", category: "Education", summary: "One clear operating platform for modern schools.", body: "Bring enrolment, student records, academic reporting, fees, attendance, and communication into one secure workspace.", benefits: ["Unified student records", "Clear fee visibility", "Faster reporting"], is_featured: true, sort_order: 10 },
  { id: "solution-2", slug: "inventory-management-system", title: "Inventory Management System", category: "Operations", summary: "Know what you have, where it is, and what needs attention.", body: "Track stock movement, supplier activity, reorder signals, and operational trends from a responsive business dashboard.", benefits: ["Live stock position", "Actionable alerts", "Reliable audit trail"], is_featured: true, sort_order: 20 },
  { id: "solution-3", slug: "business-management-platform", title: "Business Management Platform", category: "Business", summary: "Connected operations without fragmented spreadsheets.", body: "Combine customers, projects, finance workflows, documents, and reporting in a platform tailored to your organization.", benefits: ["Shared operational view", "Automated workflows", "Scalable permissions"], is_featured: true, sort_order: 30 },
  { id: "solution-4", slug: "ai-powered-solutions", title: "AI-Powered Solutions", category: "Intelligence", summary: "Practical intelligence embedded in the work your team already does.", body: "Use secure assistants, document intelligence, automation, and analytics to increase capacity and improve decisions.", benefits: ["Faster information access", "Responsible automation", "Human-centered controls"], is_featured: true, sort_order: 40 },
];

export const fallbackSettings: Pick<SiteSettingsRow, "company_name" | "tagline" | "public_email" | "phone" | "city"> = { company_name: "Infinity Aura Technologies", tagline: "Innovate. Build. Empower.", public_email: "info@infinityaura.tech", phone: "+263 716 524 607", city: "Harare" };
export const fallbackNavigation: Array<Pick<NavigationItemRow, "id" | "location" | "label" | "url" | "open_in_new_tab" | "sort_order">> = [
  { id: "nav-1", location: "header", label: "Home", url: "/", open_in_new_tab: false, sort_order: 10 },
  { id: "nav-2", location: "header", label: "About", url: "/about", open_in_new_tab: false, sort_order: 20 },
  { id: "nav-3", location: "header", label: "Services", url: "/services", open_in_new_tab: false, sort_order: 30 },
  { id: "nav-4", location: "header", label: "Solutions", url: "/solutions", open_in_new_tab: false, sort_order: 40 },
  { id: "nav-5", location: "header", label: "Contact", url: "/contact", open_in_new_tab: false, sort_order: 50 },
  { id: "nav-6", location: "footer_primary", label: "About", url: "/about", open_in_new_tab: false, sort_order: 10 },
  { id: "nav-7", location: "footer_primary", label: "Services", url: "/services", open_in_new_tab: false, sort_order: 20 },
  { id: "nav-8", location: "footer_primary", label: "Solutions", url: "/solutions", open_in_new_tab: false, sort_order: 30 },
  { id: "nav-9", location: "footer_primary", label: "Contact", url: "/contact", open_in_new_tab: false, sort_order: 40 },
  { id: "nav-10", location: "footer_services", label: "Custom software", url: "/services/custom-software-development", open_in_new_tab: false, sort_order: 10 },
  { id: "nav-11", location: "footer_services", label: "Web applications", url: "/services/web-application-development", open_in_new_tab: false, sort_order: 20 },
  { id: "nav-12", location: "footer_services", label: "AI solutions", url: "/services/artificial-intelligence", open_in_new_tab: false, sort_order: 30 },
  { id: "nav-13", location: "legal", label: "Privacy", url: "/privacy", open_in_new_tab: false, sort_order: 10 },
  { id: "nav-14", location: "legal", label: "Terms", url: "/terms", open_in_new_tab: false, sort_order: 20 },
];
export const fallbackSocialLinks: Array<Pick<SocialLinkRow, "id" | "platform" | "label" | "url" | "icon_key">> = [
  { id: "social-1", platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/infinity-aura-technologies", icon_key: "linkedin" },
  { id: "social-2", platform: "facebook", label: "Facebook", url: "#", icon_key: "facebook" },
  { id: "social-3", platform: "github", label: "GitHub", url: "#", icon_key: "github" },
];
export const fallbackTechnologyGroups = [
  { id: "cat-1", name: "Frontend", slug: "frontend", items: ["HTML5", "CSS3", "JavaScript", "Next.js"] },
  { id: "cat-2", name: "Backend", slug: "backend", items: ["TypeScript", "Python", "Django", "Node.js"] },
  { id: "cat-3", name: "Data", slug: "data", items: ["PostgreSQL", "MySQL", "Supabase", "AI"] },
  { id: "cat-4", name: "Delivery", slug: "delivery", items: ["Git", "GitHub", "Docker", "Vercel"] },
];
export const fallbackHomeSections: Array<Pick<PageSectionRow, "id" | "section_key" | "section_type" | "eyebrow" | "heading" | "accent_text" | "body" | "primary_cta_label" | "primary_cta_url" | "secondary_cta_label" | "secondary_cta_url">> = [
  { id: "section-hero", section_key: "hero", section_type: "hero", eyebrow: "Digital innovation, engineered in Zimbabwe", heading: "Building innovative digital solutions", accent_text: "for tomorrow.", body: "We help ambitious organizations transform ideas into powerful software, web platforms, mobile applications, and intelligent digital solutions.", primary_cta_label: "Start your project", primary_cta_url: "/contact", secondary_cta_label: "Explore our work", secondary_cta_url: "/services" },
  { id: "section-about", section_key: "about", section_type: "rich_text", eyebrow: "Who we are", heading: "Technology with purpose.", accent_text: "Impact by design.", body: "Infinity Aura Technologies is a forward-thinking technology company creating reliable digital products that help organizations grow, operate efficiently, and serve people better.", primary_cta_label: "Discover our company", primary_cta_url: "/about", secondary_cta_label: null, secondary_cta_url: null },
  { id: "section-services", section_key: "services", section_type: "services", eyebrow: "What we build", heading: "Expertise that moves", accent_text: "your business forward.", body: "From first strategy to dependable delivery, we engineer technology around real operating needs.", primary_cta_label: null, primary_cta_url: null, secondary_cta_label: null, secondary_cta_url: null },
  { id: "section-solutions", section_key: "solutions", section_type: "solutions", eyebrow: "Featured solutions", heading: "Platforms designed for", accent_text: "real-world momentum.", body: null, primary_cta_label: null, primary_cta_url: null, secondary_cta_label: null, secondary_cta_url: null },
  { id: "section-technologies", section_key: "technologies", section_type: "technologies", eyebrow: "Our toolkit", heading: "Modern foundations.", accent_text: "Practical choices.", body: "We select proven technologies based on product needs, long-term ownership, security, and performance.", primary_cta_label: null, primary_cta_url: null, secondary_cta_label: null, secondary_cta_url: null },
  { id: "section-cta", section_key: "cta", section_type: "cta", eyebrow: "Let's build what's next", heading: "Your next digital advantage can start with one conversation.", accent_text: null, body: null, primary_cta_label: "Start a project", primary_cta_url: "/contact", secondary_cta_label: null, secondary_cta_url: null },
];

export const getServices = cache(async () => {
  if (!hasSupabaseEnv()) return fallbackServices;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, summary, body, icon_key, is_featured, sort_order")
    .eq("status", "published")
    .order("sort_order");

  return error || !data?.length ? fallbackServices : data;
});

export const getSolutions = cache(async () => {
  if (!hasSupabaseEnv()) return fallbackSolutions;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("solutions")
    .select("id, slug, title, category, summary, body, benefits, is_featured, sort_order")
    .eq("status", "published")
    .order("sort_order");

  return error || !data?.length ? fallbackSolutions : data;
});

export async function getService(slug: string) {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
}

export async function getSolution(slug: string) {
  const solutions = await getSolutions();
  return solutions.find((solution) => solution.slug === slug) ?? null;
}

export const getSiteChrome = cache(async () => {
  if (!hasSupabaseEnv()) return { settings: fallbackSettings, navigation: fallbackNavigation, socialLinks: fallbackSocialLinks };
  const supabase = createPublicClient();
  const [settings, navigation, socialLinks] = await Promise.all([
    supabase.from("site_settings").select("company_name, tagline, public_email, phone, city").eq("id", true).maybeSingle(),
    supabase.from("navigation_items").select("id, location, label, url, open_in_new_tab, sort_order").eq("is_visible", true).order("sort_order"),
    supabase.from("social_links").select("id, platform, label, url, icon_key").eq("is_visible", true).order("sort_order"),
  ]);
  return { settings: settings.data ?? fallbackSettings, navigation: navigation.data?.length ? navigation.data : fallbackNavigation, socialLinks: socialLinks.data?.length ? socialLinks.data : fallbackSocialLinks };
});

export const getHomeSections = cache(async () => {
  if (!hasSupabaseEnv()) return fallbackHomeSections;
  const supabase = createPublicClient();
  const { data: page } = await supabase.from("pages").select("id").eq("slug", "home").eq("status", "published").maybeSingle();
  if (!page) return fallbackHomeSections;
  const { data } = await supabase.from("page_sections").select("id, section_key, section_type, eyebrow, heading, accent_text, body, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url").eq("page_id", page.id).eq("is_visible", true).order("sort_order");
  return data?.length ? data : fallbackHomeSections;
});

export const getTechnologyGroups = cache(async () => {
  if (!hasSupabaseEnv()) return fallbackTechnologyGroups;
  const supabase = createPublicClient();
  const [categories, technologies] = await Promise.all([
    supabase.from("technology_categories").select("id, name, slug, sort_order, is_visible").eq("is_visible", true).order("sort_order"),
    supabase.from("technologies").select("id, category_id, name, short_mark, website_url, sort_order, is_visible").eq("is_visible", true).order("sort_order"),
  ]);
  if (!categories.data?.length) return fallbackTechnologyGroups;
  const items = (technologies.data ?? []) as Array<Pick<TechnologyRow, "category_id" | "name">>;
  return (categories.data as TechnologyCategoryRow[]).map((category) => ({ id: category.id, name: category.name, slug: category.slug, items: items.filter((item) => item.category_id === category.id).map((item) => item.name) }));
});

export const getTestimonials = cache(async () => {
  if (!hasSupabaseEnv()) return [] as TestimonialRow[];
  const supabase = createPublicClient();
  const { data } = await supabase.from("testimonials").select("*").eq("is_approved", true).order("sort_order");
  return data ?? [];
});
