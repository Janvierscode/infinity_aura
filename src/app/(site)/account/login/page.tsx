import Link from "next/link";
import { signInWithGoogle } from "@/features/community/auth-actions";
import { MemberAuthForm } from "@/components/community/member-auth-form";

export const metadata = { title: "Sign in" };
export default async function MemberLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const next = (await searchParams).next ?? "/ideas"; return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Community account</span><h1>Sign in to join the conversation.</h1><p>Vote on business ideas and contribute useful, respectful comments.</p><form action={signInWithGoogle}><input type="hidden" name="next" value={next} /><button className="button button-secondary member-google">Continue with Google</button></form><div className="auth-divider"><span>or</span></div><MemberAuthForm mode="login" next={next} /><p className="member-auth-switch">New here? <Link href={`/account/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></p></div></section>; }
