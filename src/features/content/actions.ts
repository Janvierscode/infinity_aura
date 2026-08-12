"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { Json } from "@/types/database";

const baseSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(10).max(300),
  body: z.string().trim().min(20).max(20000),
  sortOrder: z.coerce.number().int().min(0).max(10000),
  featured: z.string().optional(),
  intent: z.enum(["draft", "published"]),
});

async function actorId() {
  const { supabase, userId } = await requireAdmin();
  return { id: userId, supabase };
}

async function recordRevision(entityType: string, entityId: string, snapshot: Json, actor: string) {
  const { supabase } = await actorId();
  const { data } = await supabase.from("content_revisions").select("revision_number").eq("entity_type", entityType).eq("entity_id", entityId).order("revision_number", { ascending: false }).limit(1).maybeSingle();
  await supabase.from("content_revisions").insert({ entity_type: entityType, entity_id: entityId, revision_number: (data?.revision_number ?? 0) + 1, snapshot, change_summary: "Saved from the admin editor", created_by: actor });
  await supabase.from("audit_logs").insert({ actor_id: actor, action: "content.saved", entity_type: entityType, entity_id: entityId, metadata: { status: (snapshot as Record<string, Json>).status ?? null } });
}

export async function saveService(formData: FormData) {
  const parsed = baseSchema.extend({ iconKey: z.string().trim().max(60).optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The service form contains invalid fields.");
  const { id: actor, supabase } = await actorId();
  const payload = { title: parsed.data.title, slug: parsed.data.slug, summary: parsed.data.summary, body: parsed.data.body, icon_key: parsed.data.iconKey || "code-2", sort_order: parsed.data.sortOrder, is_featured: parsed.data.featured === "on", status: parsed.data.intent, published_at: parsed.data.intent === "published" ? new Date().toISOString() : null, updated_by: actor } as const;
  const result = parsed.data.id
    ? await supabase.from("services").update(payload).eq("id", parsed.data.id).select().single()
    : await supabase.from("services").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save service.");
  await recordRevision("service", result.data.id, result.data as unknown as Json, actor);
  revalidatePath("/"); revalidatePath("/services"); revalidatePath(`/services/${result.data.slug}`); revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function saveSolution(formData: FormData) {
  const parsed = baseSchema.extend({ category: z.string().trim().max(80).optional(), benefits: z.string().max(3000).optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The solution form contains invalid fields.");
  const { id: actor, supabase } = await actorId();
  const benefits = (parsed.data.benefits ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
  const payload = { title: parsed.data.title, slug: parsed.data.slug, category: parsed.data.category || null, summary: parsed.data.summary, body: parsed.data.body, benefits, sort_order: parsed.data.sortOrder, is_featured: parsed.data.featured === "on", status: parsed.data.intent, published_at: parsed.data.intent === "published" ? new Date().toISOString() : null, updated_by: actor } as const;
  const result = parsed.data.id
    ? await supabase.from("solutions").update(payload).eq("id", parsed.data.id).select().single()
    : await supabase.from("solutions").insert(payload).select().single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save solution.");
  await recordRevision("solution", result.data.id, result.data as unknown as Json, actor);
  revalidatePath("/"); revalidatePath("/solutions"); revalidatePath(`/solutions/${result.data.slug}`); revalidatePath("/admin/solutions");
  redirect("/admin/solutions");
}

export async function updateEnquiryStatus(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["new", "read", "in_progress", "replied", "closed", "spam"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid enquiry status.");
  const { id: actor, supabase } = await actorId();
  const now = new Date().toISOString();
  const { error } = await supabase.from("contact_enquiries").update({ status: parsed.data.status, read_at: parsed.data.status === "new" ? null : now, closed_at: parsed.data.status === "closed" ? now : null }).eq("id", parsed.data.id);
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ actor_id: actor, action: "enquiry.status_changed", entity_type: "contact_enquiry", entity_id: parsed.data.id, metadata: { status: parsed.data.status } });
  revalidatePath("/admin"); revalidatePath("/admin/enquiries");
}

export async function saveSettings(formData: FormData) {
  const parsed = z.object({
    companyName: z.string().trim().min(2).max(120),
    legalName: z.string().trim().max(160),
    tagline: z.string().trim().min(2).max(120),
    publicEmail: z.email(),
    enquiryEmail: z.email(),
    phone: z.string().trim().max(40),
    addressLine: z.string().trim().max(180),
    city: z.string().trim().max(80),
    countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    timezone: z.string().trim().min(3).max(80),
    websiteUrl: z.url(),
    defaultMetaTitle: z.string().trim().max(160),
    defaultMetaDescription: z.string().trim().max(320),
  }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("The settings form contains invalid fields.");
  const { id: actor, supabase } = await actorId();
  const { error } = await supabase.from("site_settings").update({ company_name: parsed.data.companyName, legal_name: parsed.data.legalName || null, tagline: parsed.data.tagline, public_email: parsed.data.publicEmail, enquiry_email: parsed.data.enquiryEmail, phone: parsed.data.phone || null, address_line: parsed.data.addressLine || null, city: parsed.data.city || null, country_code: parsed.data.countryCode, timezone: parsed.data.timezone, website_url: parsed.data.websiteUrl, default_meta_title: parsed.data.defaultMetaTitle || null, default_meta_description: parsed.data.defaultMetaDescription || null, updated_by: actor }).eq("id", true);
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ actor_id: actor, action: "settings.updated", entity_type: "site_settings", entity_id: null, metadata: {} });
  revalidatePath("/"); revalidatePath("/admin/settings");
}
