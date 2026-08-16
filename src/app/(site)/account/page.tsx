import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemberProfileForm } from "@/components/community/member-account-forms";
import { signOutMember } from "@/features/community/auth-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/account/login?next=/account");
  const [profile, comments, ideaVotes, commentVotes] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
    supabase.from("idea_comments").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("idea_votes").select("idea_id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("comment_votes").select("comment_id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  const email = typeof claims.claims.email === "string" ? claims.claims.email : "Member account";
  return <section className="section account-page"><div className="container account-layout"><header><span className="section-label">Your account</span><h1>Community profile</h1><p>Manage how your name appears and review your participation.</p></header><div className="account-grid"><section className="account-panel"><h2>Profile</h2><p className="account-email">Signed in as <strong>{email}</strong></p><MemberProfileForm displayName={profile.data?.display_name ?? "Community member"} /><div className="account-links"><Link href="/account/forgot-password">Reset password</Link><form action={signOutMember}><button type="submit">Sign out</button></form></div></section><section className="account-panel"><h2>Your activity</h2><div className="account-metrics"><article><strong>{comments.count ?? 0}</strong><span>Comments</span></article><article><strong>{ideaVotes.count ?? 0}</strong><span>Idea votes</span></article><article><strong>{commentVotes.count ?? 0}</strong><span>Comment votes</span></article></div><Link className="button button-secondary" href="/ideas">Explore business ideas</Link></section></div></div></section>;
}
