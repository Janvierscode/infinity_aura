"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ideaPreviewSchema } from "@/lib/validation/idea";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type CmsActionState = { status?: "error"; message?: string };

export async function saveBusinessIdea(_: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const parsed = z.object({ id: optionalUuid, title: z.string().trim().min(2).max(160), slug, summary: z.string().trim().min(20).max(320), previewMarkdown: ideaPreviewSchema, bodyMarkdown: z.string().trim().min(20).max(100000), categoryId: z.string().uuid(), coverMediaId: optionalUuid, investment: z.enum(["low", "moderate", "high"]), launchTime: z.string().trim().max(80), featured: z.string().optional(), metaTitle: z.string().trim().max(160), metaDescription: z.string().trim().max(320), intent: z.enum(["draft", "published", "archived"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the business idea fields and try again." };
  const { supabase, userId } = await requireAdmin();
  const existing = parsed.data.id ? await supabase.from("business_ideas").select("published_at").eq("id", parsed.data.id).maybeSingle() : null;
  const payload = { title: parsed.data.title, slug: parsed.data.slug, summary: parsed.data.summary, preview_markdown: parsed.data.previewMarkdown, body_markdown: parsed.data.bodyMarkdown, category_id: parsed.data.categoryId, cover_media_id: parsed.data.coverMediaId || null, investment: parsed.data.investment, launch_time: parsed.data.launchTime || null, is_featured: parsed.data.featured === "on", meta_title: parsed.data.metaTitle || null, meta_description: parsed.data.metaDescription || null, status: parsed.data.intent, published_at: parsed.data.intent === "published" ? existing?.data?.published_at ?? new Date().toISOString() : null, updated_by: userId } as const;
  const result = parsed.data.id ? await supabase.from("business_ideas").update(payload).eq("id", parsed.data.id).select("id").single() : await supabase.from("business_ideas").insert(payload).select("id").single();
  if (result.error || !result.data) return { status: "error", message: result.error?.code === "23505" ? "That business idea URL slug is already in use." : result.error?.message ?? "Unable to save the business idea." };
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/"); revalidatePath("/ideas"); revalidatePath(`/ideas/${parsed.data.slug}`); revalidatePath("/admin/ideas"); revalidatePath("/sitemap.xml");
  redirect(`/admin/ideas/${result.data.id}`);
}

export async function deleteBusinessIdea(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const existing = await supabase.from("business_ideas").select("slug").eq("id", id).single();
  if (existing.error || !existing.data) throw new Error("Business idea not found.");
  const { error } = await supabase.from("business_ideas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/");
  revalidatePath("/ideas"); revalidatePath(`/ideas/${existing.data.slug}`); revalidatePath("/admin/ideas"); revalidatePath("/sitemap.xml");
  redirect("/admin/ideas");
}

export async function saveCategory(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, name: z.string().trim().min(2).max(80), slug, description: z.string().trim().max(240), sortOrder: z.coerce.number().int().min(0) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Review the category fields and try again.");
  const { supabase } = await requireAdmin();
  const payload = { name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description || null, sort_order: parsed.data.sortOrder };
  const result = parsed.data.id ? await supabase.from("idea_categories").update(payload).eq("id", parsed.data.id) : await supabase.from("idea_categories").insert(payload);
  if (result.error) throw new Error(result.error.code === "23505" ? "That category name or slug is already in use." : result.error.message);
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/ideas"); revalidatePath("/admin/ideas");
}

export async function deleteCategory(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from("business_ideas").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) throw new Error("Reassign the business ideas in this category before deleting it.");
  const { error } = await supabase.from("idea_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/ideas"); revalidatePath("/admin/ideas");
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file");
  const altText = z.string().trim().max(240).parse(formData.get("altText") ?? "");
  const caption = z.string().trim().max(500).parse(formData.get("caption") ?? "");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image to upload.");
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!allowed.has(file.type) || file.size > 10 * 1024 * 1024) throw new Error("Upload a JPG, PNG, WebP, or AVIF image no larger than 10 MB.");

  let processed: { data: Buffer; width: number; height: number };
  try {
    const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    processed = { data, width: info.width, height: info.height };
  } catch {
    throw new Error("This image could not be processed. Try exporting it again as JPG, PNG, WebP, or AVIF.");
  }

  const { supabase, userId } = await requireAdmin();
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.webp`;
  const upload = await supabase.storage.from("public-media").upload(objectPath, processed.data, { cacheControl: "31536000", contentType: "image/webp", upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  const publicUrl = supabase.storage.from("public-media").getPublicUrl(objectPath).data.publicUrl;
  const created = await supabase.from("media_assets").insert({ bucket: "public-media", object_path: objectPath, public_url: publicUrl, original_filename: file.name, mime_type: "image/webp", size_bytes: processed.data.byteLength, width: processed.width, height: processed.height, alt_text: altText || null, caption: caption || null, uploaded_by: userId }).select("id").single();
  if (created.error) { await supabase.storage.from("public-media").remove([objectPath]); throw new Error(created.error.message); }
  revalidatePath("/admin/media");
}

export async function updateMedia(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), altText: z.string().trim().max(240), caption: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid media metadata.");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("media_assets").update({ alt_text: parsed.data.altText || null, caption: parsed.data.caption || null }).eq("id", parsed.data.id);
  if (error) throw new Error(error.message);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/admin/media"); revalidatePath("/ideas");
}

export async function deleteMedia(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const asset = await supabase.from("media_assets").select("object_path,public_url").eq("id", id).single();
  if (asset.error || !asset.data) throw new Error("Media file not found.");
  const [services, postCovers, inlinePosts, settings] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("hero_media_id", id),
    supabase.from("business_ideas").select("id", { count: "exact", head: true }).eq("cover_media_id", id),
    supabase.from("business_ideas").select("id", { count: "exact", head: true }).like("body_markdown", `%${asset.data.public_url}%`),
    supabase.from("site_settings").select("id").or(`default_og_media_id.eq.${id},logo_media_id.eq.${id},icon_media_id.eq.${id}`),
  ]);
  const references = (services.count ?? 0) + (postCovers.count ?? 0) + (inlinePosts.count ?? 0) + (settings.data?.length ?? 0);
  if (references > 0) throw new Error(`This image is used in ${references} content record${references === 1 ? "" : "s"}.`);
  const removed = await supabase.storage.from("public-media").remove([asset.data.object_path]);
  if (removed.error) throw new Error(removed.error.message);
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function moderateComment(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), ideaId: z.string().uuid(), intent: z.enum(["visible", "hidden", "delete"]) }).parse(Object.fromEntries(formData.entries()));
  const { supabase } = await requireAdmin();
  const result = parsed.intent === "delete" ? await supabase.from("idea_comments").delete().eq("id", parsed.id) : await supabase.from("idea_comments").update({ status: parsed.intent }).eq("id", parsed.id);
  if (result.error) throw new Error(result.error.message);
  updateTag(CACHE_TAGS.comments);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath("/admin/ideas");
  revalidatePath(`/admin/ideas/${parsed.ideaId}`);
  revalidatePath("/ideas");
}
