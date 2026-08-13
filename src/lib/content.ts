import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { hasSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { BusinessIdeaWithRelations, IdeaCategoryRow, IdeaCommentWithProfile, ServiceRow, SiteSettingsRow } from "@/types/database";

type PublicService = Pick<ServiceRow, "id" | "slug" | "title" | "summary" | "body" | "icon_key" | "hero_media_id" | "is_featured" | "sort_order" | "meta_title" | "meta_description">;

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
  website_url: "https://infinity-aura-technologies.vercel.app",
  default_meta_title: "Infinity Aura Technologies | Innovate. Build. Empower.",
  default_meta_description: "Software, web, mobile, AI, and digital transformation solutions for ambitious organizations.",
};

export const getServices = unstable_cache(async (): Promise<PublicService[]> => {
  if (!hasSupabaseEnv()) return fallbackServices;
  const { data, error } = await createPublicClient().from("services").select("id, slug, title, summary, body, icon_key, hero_media_id, is_featured, sort_order, meta_title, meta_description").eq("status", "published").order("sort_order");
  return error || !data?.length ? fallbackServices : data;
}, [CACHE_TAGS.services], { tags: [CACHE_TAGS.services], revalidate: 3600 });

export async function getService(slug: string) {
  return (await getServices()).find((service) => service.slug === slug) ?? null;
}

export const getSettings = unstable_cache(async () => {
  if (!hasSupabaseEnv()) return fallbackSettings;
  const { data } = await createPublicClient().from("site_settings").select("company_name, tagline, public_email, phone, city, website_url, default_meta_title, default_meta_description").eq("id", true).maybeSingle();
  return data ?? fallbackSettings;
}, [CACHE_TAGS.settings], { tags: [CACHE_TAGS.settings], revalidate: 3600 });

export const getIdeaCategories = unstable_cache(async (): Promise<IdeaCategoryRow[]> => {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createPublicClient().from("idea_categories").select("*").order("sort_order").order("name");
  return data ?? [];
}, [CACHE_TAGS.categories], { tags: [CACHE_TAGS.categories], revalidate: 3600 });

export const getBusinessIdeas = unstable_cache(async (): Promise<BusinessIdeaWithRelations[]> => {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createPublicClient().from("business_ideas").select("*, category:idea_categories(id,name,slug), cover:media_assets(id,public_url,alt_text,width,height)").eq("status", "published").order("published_at", { ascending: false });
  return (data ?? []) as unknown as BusinessIdeaWithRelations[];
}, [CACHE_TAGS.ideas], { tags: [CACHE_TAGS.ideas], revalidate: 300 });

export async function getBusinessIdea(slug: string) {
  return (await getBusinessIdeas()).find((idea) => idea.slug === slug) ?? null;
}

export const getIdeaComments = unstable_cache(async (ideaId: string): Promise<IdeaCommentWithProfile[]> => {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createPublicClient().from("idea_comments").select("*, profile:profiles(id,display_name,avatar_url)").eq("idea_id", ideaId).eq("status", "visible").order("vote_score", { ascending: false }).order("created_at", { ascending: true });
  return (data ?? []) as unknown as IdeaCommentWithProfile[];
}, [CACHE_TAGS.comments], { tags: [CACHE_TAGS.comments], revalidate: 60 });
