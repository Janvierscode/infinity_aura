import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseSecretKey } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url } = getSupabasePublicEnv();

  return createSupabaseClient<Database>(url, getSupabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
