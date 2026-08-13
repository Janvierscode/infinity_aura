import Link from "next/link";
import { signInWithGoogle } from "@/features/community/auth-actions";
import { MemberAuthForm } from "@/components/community/member-auth-form";

export const metadata = { title: "Create account" };
export default async function MemberSignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const next = (await searchParams).next ?? "/ideas"; return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Join the community</span><h1>Create your account.</h1><p>Your account lets you vote and comment. Infinity Aura never publishes your email address.</p><form action={signInWithGoogle}><input type="hidden" name="next" value={next} /><button className="button button-secondary member-google">Continue with Google</button></form><div className="auth-divider"><span>or</span></div><MemberAuthForm mode="signup" next={next} /><p className="member-auth-switch">Already registered? <Link href={`/account/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p></div></section>; }
