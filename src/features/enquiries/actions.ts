"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv, siteUrl } from "@/lib/env";
import { contactSchema } from "@/lib/validation/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  reference?: string;
  errors?: Record<string, string[]>;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

async function notifyByEmail(input: { name: string; email: string; phone?: string; organization?: string; subject?: string; message: string; reference: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL ?? "iyakaremyejanvier@gmail.com";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Infinity Aura Website <onboarding@resend.dev>",
      to: [recipient],
      reply_to: input.email,
      subject: `New website enquiry ${input.reference}: ${input.subject || input.name}`,
      html: `<h2>New Infinity Aura website enquiry</h2><p><strong>Reference:</strong> ${escapeHtml(input.reference)}</p><p><strong>Name:</strong> ${escapeHtml(input.name)}</p><p><strong>Email:</strong> ${escapeHtml(input.email)}</p><p><strong>Phone:</strong> ${escapeHtml(input.phone || "Not provided")}</p><p><strong>Organization:</strong> ${escapeHtml(input.organization || "Not provided")}</p><p><strong>Message:</strong></p><p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  return response.ok;
}

export async function submitContactEnquiry(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.website) return { status: "success", message: "Thank you. Your message has been received." };
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SECRET_KEY) {
    return { status: "error", message: "The enquiry service is being configured. Please email info@infinityaura.tech." };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const allowedOrigins = new Set([new URL(siteUrl).origin, "http://localhost:3000", "http://127.0.0.1:3000"]);
  if (origin && !allowedOrigins.has(origin)) return { status: "error", message: "This submission could not be verified." };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_enquiries")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      organization: parsed.data.organization || null,
      subject: parsed.data.subject || "Website project enquiry",
      message: parsed.data.message,
      source_path: parsed.data.sourcePath,
    })
    .select("id, reference_number")
    .single();

  if (error || !data) return { status: "error", message: "We could not securely save your message. Please try again or email us directly." };

  let sent = false;
  try {
    sent = await notifyByEmail({ ...parsed.data, reference: data.reference_number });
  } catch {
    sent = false;
  }

  await supabase.from("contact_enquiries").update({ notification_status: sent ? "sent" : "failed" }).eq("id", data.id);

  return { status: "success", message: "Your message has been sent. Our team will respond as soon as possible.", reference: data.reference_number };
}
