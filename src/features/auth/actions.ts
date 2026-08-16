"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export type LoginState = { error?: string };
export type AuthFormState = { status?: "success" | "error"; message?: string };
const loginSchema = z.object({ email: z.email(), password: z.string().min(8) });

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv()) return { error: "Supabase is not configured for this environment." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "The email or password is incorrect." };

  const { data: authorized, error: roleError } = await supabase.rpc("is_app_admin");
  if (roleError || !authorized) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to administer the website." };
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(auth.session?.access_token);
  redirect(assurance?.currentLevel === "aal2" ? "/admin" : "/admin/mfa");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email: z.email() }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${origin}/auth/callback?next=/admin/reset-password`,
  });
  if (error) return { status: "error", message: "A recovery link could not be sent. Please try again shortly." };
  return { status: "success", message: "If that address belongs to the administrator, a secure recovery link has been sent." };
}

export async function updatePassword(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ password: z.string().min(12), confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Choose a valid password." };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { status: "error", message: "This secure link has expired. Request a new recovery email." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "Your password could not be updated. Request a new secure link." };
  redirect("/admin/mfa");
}
