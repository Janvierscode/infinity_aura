import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/password-forms";

export const metadata: Metadata = { title: "Recover admin access", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <main className="admin-login-page"><Link className="brand" href="/"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={50} height={50} /><span><strong>Infinity Aura</strong><small>Protected access</small></span></Link><ForgotPasswordForm /></main>;
}
