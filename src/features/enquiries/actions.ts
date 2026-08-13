"use server";

import { headers } from "next/headers";
import { hasSupabaseEnv, siteUrl } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema } from "@/lib/validation/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  reference?: string;
  errors?: Record<string, string[]>;
};

export async function submitContactEnquiry(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.website) return { status: "success", message: "Thank you. Your message has been received." };
  if (!hasSupabaseEnv()) {
    return { status: "error", message: "The enquiry service is being configured. Please email info@infinityaura.tech." };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const allowedOrigins = new Set([
    new URL(siteUrl).origin,
    "https://infinity-aura-technologies.vercel.app",
    "https://infinityaura.tech",
    "https://www.infinityaura.tech",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  if (origin && !allowedOrigins.has(origin)) return { status: "error", message: "This submission could not be verified." };

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .rpc("submit_contact_enquiry", {
      p_name: parsed.data.name,
      p_email: parsed.data.email.toLowerCase(),
      p_phone: parsed.data.phone || null,
      p_organization: parsed.data.organization || null,
      p_subject: parsed.data.subject || "Website project enquiry",
      p_message: parsed.data.message,
      p_source_path: parsed.data.sourcePath,
    });

  const enquiry = data?.[0];
  if (error || !enquiry) return { status: "error", message: "We could not securely save your message. Please try again or email us directly." };

  return { status: "success", message: "Your message has been received. Our team will respond as soon as possible.", reference: enquiry.reference_number };
}
