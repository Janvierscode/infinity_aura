import type { Metadata } from "next";
import Link from "next/link";
import { MemberAuthForm } from "@/components/community/member-auth-form";
import { signInWithGoogle } from "@/features/community/auth-actions";
import { googleAuthEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function MemberSignupPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const next = query.next?.startsWith("/") && !query.next.startsWith("//") ? query.next : "/ideas";
  return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Join the community</span><h1>Create your free account.</h1><p>Continue reading complete ideas, vote, and comment. Your email address is never published.</p>{query.error ? <div className="form-status error" role="alert">The sign-up request could not be completed. Please try again.</div> : null}{googleAuthEnabled ? <><form action={signInWithGoogle}><input type="hidden" name="next" value={next} /><button className="button button-secondary member-google">Continue with Google</button></form><div className="auth-divider"><span>or</span></div></> : null}<MemberAuthForm mode="signup" next={next} /><p className="member-auth-switch">Already registered? <Link href={`/account/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p></div></section>;
}
