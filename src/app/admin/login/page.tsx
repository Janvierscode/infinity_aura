import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  const configured = hasSupabaseEnv();
  return (
    <main className="admin-login-page">
      <Link className="brand" href="/"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={50} height={50} /><span><strong>Infinity Aura</strong><small>Control Centre</small></span></Link>
      {configured ? <LoginForm /> : <section className="admin-login-card"><span className="admin-alert setup">Setup required</span><h1>Connect Supabase</h1><p>Add the environment values documented in <code>.env.example</code>, run the database migrations, and provision the sole administrator account.</p><Link className="button button-secondary" href="/">Return to website</Link></section>}
    </main>
  );
}
