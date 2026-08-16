import type { Metadata } from "next";
import Link from "next/link";
import { MemberPasswordForm } from "@/components/community/member-account-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default function MemberResetPasswordPage() {
  return <section className="section member-auth-page"><div className="member-auth-card"><span className="section-label">Secure password</span><h1>Choose a new password.</h1><p>Use at least 12 characters and avoid reusing a password from another service.</p><MemberPasswordForm /><p className="member-auth-switch"><Link href="/account/forgot-password">Request a new link</Link></p></div></section>;
}
