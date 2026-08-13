import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Coins } from "lucide-react";
import { notFound } from "next/navigation";
import { IdeaDiscussion } from "@/components/ideas/idea-discussion";
import { MarkdownContent } from "@/components/ideas/markdown-content";
import { getBusinessIdea, getBusinessIdeas, getIdeaComments } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function generateStaticParams() { return (await getBusinessIdeas()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const idea = await getBusinessIdea((await params).slug); if (!idea) return {}; const canonical = `${siteUrl}/ideas/${idea.slug}`; return { title: idea.meta_title ?? idea.title, description: idea.meta_description ?? idea.summary, alternates: { canonical }, openGraph: { type: "article", title: idea.meta_title ?? idea.title, description: idea.meta_description ?? idea.summary, url: canonical, publishedTime: idea.published_at ?? undefined, modifiedTime: idea.updated_at, images: idea.cover ? [{ url: idea.cover.public_url, alt: idea.cover.alt_text ?? idea.title }] : undefined } }; }

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const idea = await getBusinessIdea((await params).slug); if (!idea) notFound();
  const comments = await getIdeaComments(idea.id);
  const supabase = await createClient(); const { data: claims } = await supabase.auth.getClaims(); const userId = claims?.claims?.sub ?? null;
  const [ideaVoteResult, commentVotesResult] = userId ? await Promise.all([
    supabase.from("idea_votes").select("value").eq("idea_id", idea.id).eq("user_id", userId).maybeSingle(),
    comments.length
      ? supabase.from("comment_votes").select("comment_id,value").eq("user_id", userId).in("comment_id", comments.map((comment) => comment.id))
      : Promise.resolve({ data: [] }),
  ]) : [{ data: null }, { data: [] }];
  const commentVotes = new Map((commentVotesResult.data ?? []).map((vote) => [vote.comment_id, vote.value]));
  const published = idea.published_at ? new Intl.DateTimeFormat("en-ZW", { dateStyle: "long" }).format(new Date(idea.published_at)) : "";
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: idea.title, description: idea.summary, image: idea.cover?.public_url, datePublished: idea.published_at, dateModified: idea.updated_at, author: { "@type": "Organization", name: "Infinity Aura Technologies" }, mainEntityOfPage: `${siteUrl}/ideas/${idea.slug}` };
  return <article className="idea-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><header className="idea-header"><div className="container idea-header-inner"><Link className="idea-back" href="/ideas"><ArrowLeft size={16} /> All business ideas</Link><div className="idea-meta"><span>{idea.category?.name ?? "Business idea"}</span><span>{published}</span></div><h1>{idea.title}</h1><p>{idea.summary}</p><div className="idea-facts"><span><Coins size={17} /> {idea.investment} investment</span>{idea.launch_time && <span><Clock3 size={17} /> {idea.launch_time} to launch</span>}</div></div></header>{idea.cover && <div className="container idea-cover"><Image src={idea.cover.public_url} alt={idea.cover.alt_text ?? idea.title} fill priority sizes="(max-width: 1000px) 100vw, 1000px" /></div>}<section className="container idea-body"><MarkdownContent markdown={idea.body_markdown} /></section><div className="container"><IdeaDiscussion idea={idea} comments={comments} userId={userId} ideaVote={ideaVoteResult.data?.value ?? null} commentVotes={commentVotes} /></div></article>;
}
