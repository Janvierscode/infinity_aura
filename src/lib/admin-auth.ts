import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(options: { requireMfa?: boolean } = { requireMfa: true }) {
  const supabase = await createClient();
  const [{ data: claims }, { data: authorized }, { data: assurance }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.rpc("is_app_admin"),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  const userId = claims?.claims?.sub;
  if (!userId || !authorized) redirect("/admin/login");
  if (options.requireMfa !== false && assurance?.currentLevel !== "aal2") redirect("/admin/mfa");
  return { supabase, userId, email: typeof claims.claims.email === "string" ? claims.claims.email : "Administrator", assurance };
}
