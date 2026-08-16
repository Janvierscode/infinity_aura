import type { Metadata } from "next";
import Link from "next/link";
import { MemberRecoveryForm } from "@/components/community/member-account-forms";

export const metadata: Metadata = { title: "Recover account", robots: { index: false, follow: false } };

export default function MemberForgotPasswordPage() {
  return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Account recovery</span><h1>Reset your password.</h1><p>Enter your account email and we will send a time-limited secure link.</p><MemberRecoveryForm /><p className="member-auth-switch"><Link href="/account/login">Return to sign in</Link></p></div></section>;
}
