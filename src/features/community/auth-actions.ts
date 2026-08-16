"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { googleAuthEnabled, siteUrl } from "@/lib/env";
import { safeRelativePath } from "@/lib/ideas";

export type MemberAuthState = { status?: "success" | "error"; message?: string };

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(12, "Use at least 12 characters."),
  next: z.string().optional(),
});

export async function signInMember(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email.toLowerCase(), password: parsed.data.password });
  if (error) return { status: "error", message: "The email or password is incorrect." };
  redirect(safeRelativePath(parsed.data.next));
}

export async function signUpMember(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = credentialsSchema.extend({ displayName: z.string().trim().min(2).max(80) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const next = safeRelativePath(parsed.data.next);
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
  const next = safeRelativePath(String(formData.get("next") ?? ""));
  if (!googleAuthEnabled) redirect(`/account/login?error=google-disabled&next=${encodeURIComponent(next)}`);
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

export async function requestMemberPasswordReset(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = z.object({ email: z.email("Enter a valid email address.") }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), { redirectTo: `${siteUrl}/auth/callback?next=/account/reset-password` });
  if (error) return { status: "error", message: "A recovery link could not be sent. Please try again shortly." };
  return { status: "success", message: "If an account exists for that email, a secure recovery link has been sent." };
}

export async function updateMemberPassword(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = z.object({ password: z.string().min(12, "Use at least 12 characters."), confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { status: "error", message: "This secure link has expired. Request a new recovery email." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "Your password could not be updated. Request a new secure link." };
  redirect("/account?password=updated");
}

export async function updateMemberProfile(_: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const parsed = z.object({ displayName: z.string().trim().min(2, "Use at least 2 characters.").max(80) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { status: "error", message: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("profiles").update({ display_name: parsed.data.displayName }).eq("id", userId);
  if (error) return { status: "error", message: "Your profile could not be updated." };
  return { status: "success", message: "Your display name has been updated." };
}
