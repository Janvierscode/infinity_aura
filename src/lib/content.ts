import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { hasSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  BusinessIdeaWithRelations,
  IdeaCategoryRow,
  ServiceRow,
  SiteSettingsRow,
} from "@/types/database";

type PublicService = Pick<
  ServiceRow,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "body"
  | "icon_key"
  | "hero_media_id"
  | "is_featured"
  | "sort_order"
  | "meta_title"
  | "meta_description"
>;

const serviceFields = "id,slug,title,summary,body,icon_key,hero_media_id,is_featured,sort_order,meta_title,meta_description";
const ideaFields = "id,title,slug,summary,preview_markdown,category_id,cover_media_id,investment,launch_time,status,is_featured,upvote_count,downvote_count,vote_score,comment_count,meta_title,meta_description,published_at,created_at,updated_at,category:idea_categories(id,name,slug),cover:media_assets(id,public_url,alt_text,width,height)";

export const fallbackServices: PublicService[] = [
  { id: "service-1", slug: "custom-software-development", title: "Custom Software Development", summary: "Purpose-built systems shaped around your workflows, people, and growth goals.", body: "We design and engineer secure, maintainable software that turns complex operating needs into dependable digital products.", icon_key: "code-2", hero_media_id: null, is_featured: true, sort_order: 10, meta_title: null, meta_description: null },
  { id: "service-2", slug: "web-application-development", title: "Web Application Development", summary: "Fast, accessible platforms built for users and engineered for measurable results.", body: "From customer portals to internal platforms, we create responsive web applications with durable architecture and polished experiences.", icon_key: "panels-top-left", hero_media_id: null, is_featured: true, sort_order: 20, meta_title: null, meta_description: null },
  { id: "service-3", slug: "mobile-app-development", title: "Mobile App Development", summary: "Intuitive mobile products that keep your services close to the people who need them.", body: "We build practical mobile experiences that work across devices and connect cleanly to your wider digital ecosystem.", icon_key: "smartphone", hero_media_id: null, is_featured: true, sort_order: 30, meta_title: null, meta_description: null },
  { id: "service-4", slug: "business-automation", title: "Business Automation", summary: "Streamlined processes that reduce repetitive work and improve operational visibility.", body: "We map critical processes and replace avoidable manual effort with transparent, auditable workflows.", icon_key: "workflow", hero_media_id: null, is_featured: true, sort_order: 40, meta_title: null, meta_description: null },
];

export const fallbackSettings: Pick<SiteSettingsRow, "company_name" | "tagline" | "public_email" | "phone" | "city" | "website_url" | "default_meta_title" | "default_meta_description"> = {
  company_name: "Infinity Aura Technologies",
  tagline: "Innovate. Build. Empower.",
  public_email: "info@infinityaura.tech",
  phone: "+263 716 524 607",
  city: "Harare",
  website_url: "https://www.infinityaura.tech",
  default_meta_title: "Infinity Aura Technologies | Innovate. Build. Empower.",
  default_meta_description: "Software, web, mobile, AI, and digital transformation solutions for ambitious organizations.",
};

export const getServices = unstable_cache(async (): Promise<PublicService[]> => {
  if (!hasSupabaseEnv()) return fallbackServices;
  const { data, error } = await createPublicClient().from("services").select(serviceFields).eq("status", "published").order("sort_order");
  if (error) throw new Error(`Unable to load services: ${error.message}`);
  return (data ?? []) as PublicService[];
}, [CACHE_TAGS.services], { tags: [CACHE_TAGS.services], revalidate: 3600 });

export const getService = unstable_cache(async (slug: string): Promise<PublicService | null> => {
  if (!hasSupabaseEnv()) return fallbackServices.find((service) => service.slug === slug) ?? null;
  const { data, error } = await createPublicClient().from("services").select(serviceFields).eq("status", "published").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Unable to load service: ${error.message}`);
  return data as PublicService | null;
}, ["public-service"], { tags: [CACHE_TAGS.services], revalidate: 3600 });

export const getSettings = unstable_cache(async () => {
  if (!hasSupabaseEnv()) return fallbackSettings;
  const { data, error } = await createPublicClient().from("site_settings").select("company_name,tagline,public_email,phone,city,website_url,default_meta_title,default_meta_description").eq("id", true).maybeSingle();
  if (error) throw new Error(`Unable to load site settings: ${error.message}`);
  return data ?? fallbackSettings;
}, [CACHE_TAGS.settings], { tags: [CACHE_TAGS.settings], revalidate: 3600 });

export const getIdeaCategories = unstable_cache(async (): Promise<IdeaCategoryRow[]> => {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await createPublicClient().from("idea_categories").select("id,name,slug,description,sort_order,created_at,updated_at").order("sort_order").order("name");
  if (error) throw new Error(`Unable to load idea categories: ${error.message}`);
  return data ?? [];
}, [CACHE_TAGS.categories], { tags: [CACHE_TAGS.categories], revalidate: 3600 });

export const getBusinessIdeas = unstable_cache(async (): Promise<BusinessIdeaWithRelations[]> => {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await createPublicClient().from("business_ideas").select(ideaFields).eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  if (error) throw new Error(`Unable to load business ideas: ${error.message}`);
  return (data ?? []) as unknown as BusinessIdeaWithRelations[];
}, [CACHE_TAGS.ideas], { tags: [CACHE_TAGS.ideas], revalidate: 300 });

export const getBusinessIdea = unstable_cache(async (slug: string): Promise<BusinessIdeaWithRelations | null> => {
  if (!hasSupabaseEnv()) return null;
  const { data, error } = await createPublicClient().from("business_ideas").select(ideaFields).eq("status", "published").lte("published_at", new Date().toISOString()).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Unable to load business idea: ${error.message}`);
  return data as unknown as BusinessIdeaWithRelations | null;
}, ["public-business-idea"], { tags: [CACHE_TAGS.ideas], revalidate: 300 });
