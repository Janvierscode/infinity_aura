import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/admin/password-forms";

export const metadata: Metadata = { title: "Set admin password", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <main className="admin-login-page"><Link className="brand" href="/"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={50} height={50} /><span><strong>Infinity Aura</strong><small>Protected access</small></span></Link><ResetPasswordForm /></main>;
}
