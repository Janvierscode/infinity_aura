import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MfaSetup } from "@/components/admin/mfa-setup";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin verification", robots: { index: false, follow: false } };

export default async function AdminMfaPage() {
  const { supabase, assurance } = await requireAdmin({ requireMfa: false });
  if (assurance?.currentLevel === "aal2") redirect("/admin");
  const { data } = await supabase.auth.mfa.listFactors();
  const hasVerifiedFactor = Boolean(data?.totp.some((factor) => factor.status === "verified"));
  return <main className="admin-login-page"><Link className="brand" href="/"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={50} height={50} /><span><strong>Infinity Aura</strong><small>Protected access</small></span></Link><MfaSetup hasVerifiedFactor={hasVerifiedFactor} /></main>;
}
