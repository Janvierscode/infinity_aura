import "server-only";

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseEnv() {
  return Boolean(publicUrl && publishableKey);
}

export function getSupabasePublicEnv() {
  if (!publicUrl || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { publishableKey, url: publicUrl };
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

if (process.env.VERCEL_ENV === "production" && (!configuredSiteUrl || configuredSiteUrl.includes("localhost"))) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be configured with the canonical production URL.");
}

export const siteUrl = configuredSiteUrl ?? "http://localhost:3000";
export const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
