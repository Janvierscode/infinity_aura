"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";

export type MemberAuthState = { status?: "success" | "error"; message?: string };

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(12, "Use at least 12 characters."),
  next: z.string().optional(),
});

function safeNext(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/ideas";
}

export async function signInMember(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email.toLowerCase(), password: parsed.data.password });
  if (error) return { status: "error", message: "The email or password is incorrect." };
  redirect(safeNext(parsed.data.next));
}

export async function signUpMember(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = credentialsSchema.extend({ displayName: z.string().trim().min(2).max(80) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const next = safeNext(parsed.data.next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { status: "error", message: error.message };
  if (data.session) redirect(next);
  return { status: "success", message: "Check your email to confirm your account, then sign in." };
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(`/account/login?error=oauth&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}

export async function signOutMember() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/ideas");
}
