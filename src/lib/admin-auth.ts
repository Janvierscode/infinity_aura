import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(options: { requireMfa?: boolean } = { requireMfa: true }) {
  const supabase = await createClient();
  const [{ data: claims }, { data: authorized }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.rpc("is_app_admin"),
  ]);
  const userId = claims?.claims?.sub;
  const currentLevel = claims?.claims?.aal === "aal2" ? "aal2" : userId ? "aal1" : null;
  if (!userId || !authorized) redirect("/admin/login");
  if (options.requireMfa !== false && currentLevel !== "aal2") redirect("/admin/mfa");
  return { supabase, userId, email: typeof claims.claims.email === "string" ? claims.claims.email : "Administrator", assurance: { currentLevel } };
}
