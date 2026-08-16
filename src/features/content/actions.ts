"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { CACHE_TAGS } from "@/lib/cache-tags";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function saveService(formData: FormData) {
  const parsed = z.object({ id: optionalUuid, title: z.string().trim().min(2).max(120), slug, summary: z.string().trim().min(10).max(300), body: z.string().trim().min(20).max(20000), iconKey: z.string().trim().max(40), sortOrder: z.coerce.number().int().min(0), featured: z.string().optional(), metaTitle: z.string().trim().max(160), metaDescription: z.string().trim().max(320), intent: z.enum(["draft", "published", "archived"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Review the service fields and try again.");
  const { supabase, userId } = await requireAdmin();
  const payload = { title: parsed.data.title, slug: parsed.data.slug, summary: parsed.data.summary, body: parsed.data.body, icon_key: parsed.data.iconKey || null, sort_order: parsed.data.sortOrder, is_featured: parsed.data.featured === "on", meta_title: parsed.data.metaTitle || null, meta_description: parsed.data.metaDescription || null, status: parsed.data.intent, published_at: parsed.data.intent === "published" ? new Date().toISOString() : null, updated_by: userId } as const;
  const result = parsed.data.id ? await supabase.from("services").update(payload).eq("id", parsed.data.id).select("id").single() : await supabase.from("services").insert(payload).select("id").single();
  if (result.error || !result.data) throw new Error(result.error?.code === "23505" ? "That service URL slug is already in use." : result.error?.message ?? "Unable to save the service.");
  updateTag(CACHE_TAGS.services);
  revalidatePath("/"); revalidatePath("/services"); revalidatePath(`/services/${parsed.data.slug}`); revalidatePath("/admin/services"); revalidatePath("/sitemap.xml");
  redirect(`/admin/services/${result.data.id}`);
}

export async function deleteService(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const existing = await supabase.from("services").select("slug").eq("id", id).single();
  if (existing.error || !existing.data) throw new Error("Service not found.");
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(CACHE_TAGS.services);
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${existing.data.slug}`);
  revalidatePath("/admin/services");
  revalidatePath("/sitemap.xml");
  redirect("/admin/services");
}

export async function updateLead(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["new", "read", "in_progress", "replied", "closed", "spam"]), internalNote: z.string().trim().max(5000) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The lead update is invalid.");
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase.from("contact_enquiries").update({ status: parsed.data.status, internal_note: parsed.data.internalNote || null, read_at: parsed.data.status === "new" ? null : now, closed_at: parsed.data.status === "closed" ? now : null }).eq("id", parsed.data.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin"); revalidatePath("/admin/leads"); revalidatePath(`/admin/leads/${parsed.data.id}`);
}

export async function deleteLead(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function saveSettings(formData: FormData) {
  const parsed = z.object({ companyName: z.string().trim().min(2).max(120), legalName: z.string().trim().max(160), tagline: z.string().trim().min(2).max(160), publicEmail: z.email(), enquiryEmail: z.email(), phone: z.string().trim().max(60), addressLine: z.string().trim().max(200), city: z.string().trim().max(100), countryCode: z.string().trim().length(2), timezone: z.string().trim().min(3).max(100), websiteUrl: z.url(), defaultMetaTitle: z.string().trim().max(160), defaultMetaDescription: z.string().trim().max(320) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Review the company settings and try again.");
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("site_settings").update({ company_name: parsed.data.companyName, legal_name: parsed.data.legalName || null, tagline: parsed.data.tagline, public_email: parsed.data.publicEmail, enquiry_email: parsed.data.enquiryEmail, phone: parsed.data.phone || null, address_line: parsed.data.addressLine || null, city: parsed.data.city || null, country_code: parsed.data.countryCode.toUpperCase(), timezone: parsed.data.timezone, website_url: parsed.data.websiteUrl, default_meta_title: parsed.data.defaultMetaTitle || null, default_meta_description: parsed.data.defaultMetaDescription || null, updated_by: userId }).eq("id", true);
  if (error) throw new Error(error.message);
  updateTag(CACHE_TAGS.settings);
  revalidatePath("/"); revalidatePath("/contact"); revalidatePath("/admin/settings");
}
