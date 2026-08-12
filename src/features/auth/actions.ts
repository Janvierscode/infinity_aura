"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export type LoginState = { error?: string };
const loginSchema = z.object({ email: z.email(), password: z.string().min(8) });

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv()) return { error: "Supabase is not configured for this environment." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "The email or password is incorrect." };

  const { data: authorized, error: roleError } = await supabase.rpc("is_app_admin");
  if (roleError || !authorized) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to administer the website." };
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  redirect(assurance?.currentLevel === "aal2" ? "/admin" : "/admin/mfa");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
