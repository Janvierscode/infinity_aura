"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { Json, NavigationLocation, SectionType } from "@/types/database";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const url = z.string().trim().refine((value) => value.startsWith("/") || value.startsWith("https://") || value === "#", "Enter an internal path or secure URL.");

async function context() {
  const { supabase, userId } = await requireAdmin();
  return { supabase, actor: userId };
}

async function audit(action: string, entityType: string, entityId: string | null, metadata: Json = {}) {
  const { supabase, actor } = await context();
  const { error } = await supabase.from("audit_logs").insert({ actor_id: actor, action, entity_type: entityType, entity_id: entityId, metadata });
  if (error) throw new Error(error.message);
}

async function recordRevision(
  entityType: string,
  entityId: string,
  snapshot: Json,
  actor: string,
  changeSummary: string,
) {
  const { supabase } = await context();
  const latest = await supabase
    .from("content_revisions")
    .select("revision_number")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest.error) throw new Error(latest.error.message);

  const { error } = await supabase.from("content_revisions").insert({
    entity_type: entityType,
    entity_id: entityId,
    revision_number: (latest.data?.revision_number ?? 0) + 1,
    snapshot,
    change_summary: changeSummary,
    created_by: actor,
  });
  if (error) throw new Error(error.message);
}

export async function savePage(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, name: z.string().trim().min(2).max(120), slug, metaTitle: z.string().trim().max(160), metaDescription: z.string().trim().max(320), canonicalUrl: z.string().trim().max(300), robotsIndex: z.string().optional(), intent: z.enum(["draft", "published", "archived"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The page fields are invalid.");
  const { supabase, actor } = await context();
  const payload = { name: parsed.data.name, slug: parsed.data.slug, meta_title: parsed.data.metaTitle || null, meta_description: parsed.data.metaDescription || null, canonical_url: parsed.data.canonicalUrl || null, robots_index: parsed.data.robotsIndex === "on", status: parsed.data.intent, published_at: parsed.data.intent === "published" ? new Date().toISOString() : null, updated_by: actor } as const;
  const result = parsed.data.id ? await supabase.from("pages").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("pages").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save page.");
  await recordRevision("page", result.data.id, result.data as unknown as Json, actor, `Page saved as ${result.data.status}`);
  await audit("page.saved", "page", result.data.id, { status: result.data.status, slug: result.data.slug });
  revalidatePath("/"); revalidatePath("/admin/pages");
  redirect(`/admin/pages/${result.data.id}`);
}

export async function savePageSection(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, pageId: z.string().uuid(), sectionKey: slug, sectionType: z.enum(["hero", "rich_text", "purpose", "services", "statistics", "solutions", "technologies", "testimonials", "contact", "cta"]), eyebrow: z.string().trim().max(140), heading: z.string().trim().max(240), accentText: z.string().trim().max(180), body: z.string().trim().max(5000), primaryLabel: z.string().trim().max(80), primaryUrl: z.string().trim().max(300), secondaryLabel: z.string().trim().max(80), secondaryUrl: z.string().trim().max(300), sortOrder: z.coerce.number().int().min(0), visible: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The section fields are invalid.");
  const { supabase, actor } = await context();
  const payload = { page_id: parsed.data.pageId, section_key: parsed.data.sectionKey, section_type: parsed.data.sectionType as SectionType, eyebrow: parsed.data.eyebrow || null, heading: parsed.data.heading || null, accent_text: parsed.data.accentText || null, body: parsed.data.body || null, primary_cta_label: parsed.data.primaryLabel || null, primary_cta_url: parsed.data.primaryUrl || null, secondary_cta_label: parsed.data.secondaryLabel || null, secondary_cta_url: parsed.data.secondaryUrl || null, sort_order: parsed.data.sortOrder, is_visible: parsed.data.visible === "on", updated_by: actor };
  const result = parsed.data.id ? await supabase.from("page_sections").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("page_sections").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save section.");
  await recordRevision("page_section", result.data.id, result.data as unknown as Json, actor, `Section ${result.data.section_key} saved`);
  await audit("section.saved", "page_section", result.data.id, { page_id: parsed.data.pageId, section_key: parsed.data.sectionKey });
  revalidatePath("/"); revalidatePath(`/admin/pages/${parsed.data.pageId}`);
}

export async function deletePageSection(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), pageId: z.string().uuid() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid section.");
  const { supabase } = await context();
  const { error } = await supabase.from("page_sections").delete().eq("id", parsed.data.id);
  if (error) throw new Error(error.message);
  await audit("section.deleted", "page_section", parsed.data.id, { page_id: parsed.data.pageId });
  revalidatePath("/"); revalidatePath(`/admin/pages/${parsed.data.pageId}`);
}

export async function saveTechnologyCategory(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, name: z.string().trim().min(2).max(80), slug, sortOrder: z.coerce.number().int().min(0), visible: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The category fields are invalid.");
  const { supabase } = await context();
  const payload = { name: parsed.data.name, slug: parsed.data.slug, sort_order: parsed.data.sortOrder, is_visible: parsed.data.visible === "on" };
  const result = parsed.data.id ? await supabase.from("technology_categories").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("technology_categories").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save category.");
  await audit("technology_category.saved", "technology_category", result.data.id);
  revalidatePath("/"); revalidatePath("/admin/technologies");
}

export async function saveTechnology(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, categoryId: z.string().uuid(), name: z.string().trim().min(1).max(80), shortMark: z.string().trim().max(12), websiteUrl: z.string().trim().max(300), sortOrder: z.coerce.number().int().min(0), visible: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The technology fields are invalid.");
  const { supabase } = await context();
  const payload = { category_id: parsed.data.categoryId, name: parsed.data.name, short_mark: parsed.data.shortMark || null, website_url: parsed.data.websiteUrl || null, sort_order: parsed.data.sortOrder, is_visible: parsed.data.visible === "on" };
  const result = parsed.data.id ? await supabase.from("technologies").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("technologies").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save technology.");
  await audit("technology.saved", "technology", result.data.id);
  revalidatePath("/"); revalidatePath("/admin/technologies");
}

export async function deleteTechnology(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), kind: z.enum(["item", "category"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid technology record.");
  const { supabase } = await context();
  const result = parsed.data.kind === "item" ? await supabase.from("technologies").delete().eq("id", parsed.data.id) : await supabase.from("technology_categories").delete().eq("id", parsed.data.id);
  if (result.error) throw new Error(result.error.message);
  await audit("technology.deleted", parsed.data.kind === "item" ? "technology" : "technology_category", parsed.data.id);
  revalidatePath("/"); revalidatePath("/admin/technologies");
}

export async function saveTestimonial(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, quote: z.string().trim().min(20).max(1000), personName: z.string().trim().min(2).max(120), personRole: z.string().trim().max(120), organization: z.string().trim().max(120), sortOrder: z.coerce.number().int().min(0), approved: z.string().optional(), featured: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The testimonial fields are invalid.");
  const { supabase, actor } = await context();
  const approved = parsed.data.approved === "on";
  const payload = { quote: parsed.data.quote, person_name: parsed.data.personName, person_role: parsed.data.personRole || null, organization: parsed.data.organization || null, sort_order: parsed.data.sortOrder, is_approved: approved, is_featured: parsed.data.featured === "on", published_at: approved ? new Date().toISOString() : null, updated_by: actor };
  const result = parsed.data.id ? await supabase.from("testimonials").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("testimonials").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save testimonial.");
  await recordRevision("testimonial", result.data.id, result.data as unknown as Json, actor, approved ? "Testimonial approved" : "Testimonial saved as draft");
  await audit("testimonial.saved", "testimonial", result.data.id, { approved });
  revalidatePath("/"); revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await context();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await audit("testimonial.deleted", "testimonial", id);
  revalidatePath("/"); revalidatePath("/admin/testimonials");
}

export async function saveNavigationItem(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, location: z.enum(["header", "footer_primary", "footer_services", "legal"]), label: z.string().trim().min(1).max(80), url, sortOrder: z.coerce.number().int().min(0), visible: z.string().optional(), newTab: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The navigation fields are invalid.");
  const { supabase } = await context();
  const payload = { location: parsed.data.location as NavigationLocation, label: parsed.data.label, url: parsed.data.url, sort_order: parsed.data.sortOrder, is_visible: parsed.data.visible === "on", open_in_new_tab: parsed.data.newTab === "on" };
  const result = parsed.data.id ? await supabase.from("navigation_items").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("navigation_items").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save navigation item.");
  await audit("navigation.saved", "navigation_item", result.data.id, { location: result.data.location });
  revalidatePath("/"); revalidatePath("/admin/navigation");
}

export async function saveSocialLink(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, platform: z.string().trim().min(1).max(40), label: z.string().trim().min(1).max(80), url, iconKey: z.string().trim().min(1).max(40), sortOrder: z.coerce.number().int().min(0), visible: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The social link fields are invalid.");
  const { supabase } = await context();
  const payload = { platform: parsed.data.platform, label: parsed.data.label, url: parsed.data.url, icon_key: parsed.data.iconKey, sort_order: parsed.data.sortOrder, is_visible: parsed.data.visible === "on" };
  const result = parsed.data.id ? await supabase.from("social_links").update(payload).eq("id", parsed.data.id).select().single() : await supabase.from("social_links").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save social link.");
  await audit("social_link.saved", "social_link", result.data.id);
  revalidatePath("/"); revalidatePath("/admin/navigation");
}

export async function deleteLink(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), kind: z.enum(["navigation", "social"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid link.");
  const { supabase } = await context();
  const result = parsed.data.kind === "navigation" ? await supabase.from("navigation_items").delete().eq("id", parsed.data.id) : await supabase.from("social_links").delete().eq("id", parsed.data.id);
  if (result.error) throw new Error(result.error.message);
  await audit("link.deleted", parsed.data.kind, parsed.data.id);
  revalidatePath("/"); revalidatePath("/admin/navigation");
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file");
  const altText = z.string().trim().max(240).parse(formData.get("altText") ?? "");
  const caption = z.string().trim().max(500).parse(formData.get("caption") ?? "");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image to upload.");
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);
  if (!allowed.has(file.type) || file.size > 10 * 1024 * 1024) throw new Error("Upload a supported image no larger than 10 MB.");
  const { supabase, actor } = await context();
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("public-media").upload(objectPath, file, { contentType: file.type, upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  const publicUrl = supabase.storage.from("public-media").getPublicUrl(objectPath).data.publicUrl;
  const created = await supabase.from("media_assets").insert({ bucket: "public-media", object_path: objectPath, public_url: publicUrl, original_filename: file.name, mime_type: file.type, size_bytes: file.size, alt_text: altText || null, caption: caption || null, uploaded_by: actor }).select().single();
  if (created.error || !created.data) { await supabase.storage.from("public-media").remove([objectPath]); throw new Error(created.error?.message ?? "Unable to record media metadata."); }
  await audit("media.uploaded", "media_asset", created.data.id, { object_path: objectPath, size_bytes: file.size });
  revalidatePath("/admin/media");
}

export async function updateMedia(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), altText: z.string().trim().max(240), caption: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid media metadata.");
  const { supabase } = await context();
  const { error } = await supabase.from("media_assets").update({ alt_text: parsed.data.altText || null, caption: parsed.data.caption || null }).eq("id", parsed.data.id);
  if (error) throw new Error(error.message);
  await audit("media.updated", "media_asset", parsed.data.id);
  revalidatePath("/admin/media");
}

export async function deleteMedia(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await context();
  const [asset, services, solutions, pages, sections, settings, testimonials, technologies] = await Promise.all([
    supabase.from("media_assets").select("object_path").eq("id", id).single(),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("hero_media_id", id),
    supabase.from("solutions").select("id", { count: "exact", head: true }).eq("hero_media_id", id),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("og_media_id", id),
    supabase.from("page_sections").select("id", { count: "exact", head: true }).eq("media_id", id),
    supabase.from("site_settings").select("id").or(`default_og_media_id.eq.${id},logo_media_id.eq.${id},icon_media_id.eq.${id}`),
    supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("avatar_media_id", id),
    supabase.from("technologies").select("id", { count: "exact", head: true }).eq("logo_media_id", id),
  ]);
  const references = (services.count ?? 0) + (solutions.count ?? 0) + (pages.count ?? 0) + (sections.count ?? 0) + (testimonials.count ?? 0) + (technologies.count ?? 0) + (settings.data?.length ?? 0);
  if (references > 0) throw new Error(`This file is used in ${references} content record${references === 1 ? "" : "s"}. Replace those references before deleting it.`);
  if (asset.error || !asset.data) throw new Error("Media file not found.");
  const removed = await supabase.storage.from("public-media").remove([asset.data.object_path]);
  if (removed.error) throw new Error(removed.error.message);
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await audit("media.deleted", "media_asset", id, { object_path: asset.data.object_path });
  revalidatePath("/admin/media");
}

export async function restoreRevision(formData: FormData) {
  const parsed = z.object({ revisionId: z.string().uuid() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid revision.");
  const { supabase, actor } = await context();
  const { data: revision, error } = await supabase.from("content_revisions").select("*").eq("id", parsed.data.revisionId).single();
  if (error || !revision || typeof revision.snapshot !== "object" || Array.isArray(revision.snapshot) || revision.snapshot === null) throw new Error("Revision cannot be restored.");
  const source = revision.snapshot as Record<string, Json | undefined>;
  const shared = { title: String(source.title ?? ""), slug: String(source.slug ?? ""), summary: String(source.summary ?? ""), body: String(source.body ?? ""), status: "draft" as const, published_at: null, updated_by: actor };
  let restoreError: { message: string } | null = null;
  if (revision.entity_type === "service") ({ error: restoreError } = await supabase.from("services").update({ ...shared, icon_key: typeof source.icon_key === "string" ? source.icon_key : null, is_featured: Boolean(source.is_featured), sort_order: Number(source.sort_order ?? 0) }).eq("id", revision.entity_id));
  else if (revision.entity_type === "solution") ({ error: restoreError } = await supabase.from("solutions").update({ ...shared, category: typeof source.category === "string" ? source.category : null, benefits: source.benefits ?? [], is_featured: Boolean(source.is_featured), sort_order: Number(source.sort_order ?? 0) }).eq("id", revision.entity_id));
  else if (revision.entity_type === "page") ({ error: restoreError } = await supabase.from("pages").update({ name: String(source.name ?? ""), slug: String(source.slug ?? ""), status: "draft", meta_title: typeof source.meta_title === "string" ? source.meta_title : null, meta_description: typeof source.meta_description === "string" ? source.meta_description : null, canonical_url: typeof source.canonical_url === "string" ? source.canonical_url : null, robots_index: Boolean(source.robots_index), published_at: null, updated_by: actor }).eq("id", revision.entity_id));
  else if (revision.entity_type === "page_section") ({ error: restoreError } = await supabase.from("page_sections").update({ section_key: String(source.section_key ?? ""), section_type: String(source.section_type ?? "rich_text") as SectionType, eyebrow: typeof source.eyebrow === "string" ? source.eyebrow : null, heading: typeof source.heading === "string" ? source.heading : null, accent_text: typeof source.accent_text === "string" ? source.accent_text : null, body: typeof source.body === "string" ? source.body : null, primary_cta_label: typeof source.primary_cta_label === "string" ? source.primary_cta_label : null, primary_cta_url: typeof source.primary_cta_url === "string" ? source.primary_cta_url : null, secondary_cta_label: typeof source.secondary_cta_label === "string" ? source.secondary_cta_label : null, secondary_cta_url: typeof source.secondary_cta_url === "string" ? source.secondary_cta_url : null, sort_order: Number(source.sort_order ?? 0), is_visible: Boolean(source.is_visible), updated_by: actor }).eq("id", revision.entity_id));
  else if (revision.entity_type === "testimonial") ({ error: restoreError } = await supabase.from("testimonials").update({ quote: String(source.quote ?? ""), person_name: String(source.person_name ?? ""), person_role: typeof source.person_role === "string" ? source.person_role : null, organization: typeof source.organization === "string" ? source.organization : null, is_approved: false, is_featured: Boolean(source.is_featured), sort_order: Number(source.sort_order ?? 0), published_at: null, updated_by: actor }).eq("id", revision.entity_id));
  else throw new Error("This revision type is view-only.");
  if (restoreError) throw new Error(restoreError.message);
  await audit("content.restored", revision.entity_type, revision.entity_id, { revision_number: revision.revision_number });
  revalidatePath("/");
  revalidatePath("/admin/revisions");
  if (revision.entity_type === "page_section" && typeof source.page_id === "string") revalidatePath(`/admin/pages/${source.page_id}`);
  else if (revision.entity_type === "page") revalidatePath(`/admin/pages/${revision.entity_id}`);
  else revalidatePath(`/admin/${revision.entity_type}s/${revision.entity_id}`);
}
