import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/** Request-independent anonymous client for published public content. */
export function createPublicClient() {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) => {
        const timeout = AbortSignal.timeout(6000);
        const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
        return fetch(input, { ...init, signal });
      },
    },
  });
}
