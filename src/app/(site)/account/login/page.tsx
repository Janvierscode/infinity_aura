import type { Metadata } from "next";
import Link from "next/link";
import { MemberAuthForm } from "@/components/community/member-auth-form";
import { signInWithGoogle } from "@/features/community/auth-actions";
import { googleAuthEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  callback: "The secure sign-in link could not be completed. Please try again.",
  oauth: "Google sign-in could not be started. Please use email or try again later.",
  "google-disabled": "Google sign-in is not configured yet. Please use your email and password.",
};

export default async function MemberLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const next = query.next?.startsWith("/") && !query.next.startsWith("//") ? query.next : "/ideas";
  return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Community account</span><h1>Sign in to continue.</h1><p>Read complete business guides, vote, and contribute useful community insight.</p>{query.error && errorMessages[query.error] ? <div className="form-status error" role="alert">{errorMessages[query.error]}</div> : null}{googleAuthEnabled ? <><form action={signInWithGoogle}><input type="hidden" name="next" value={next} /><button className="button button-secondary member-google">Continue with Google</button></form><div className="auth-divider"><span>or</span></div></> : null}<MemberAuthForm mode="login" next={next} /><p className="member-auth-switch"><Link href="/account/forgot-password">Forgot your password?</Link></p><p className="member-auth-switch">New here? <Link href={`/account/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></p></div></section>;
}
