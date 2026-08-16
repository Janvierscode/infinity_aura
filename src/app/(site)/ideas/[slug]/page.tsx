import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Coins } from "lucide-react";
import { notFound } from "next/navigation";
import { IdeaDiscussion } from "@/components/ideas/idea-discussion";
import { MarkdownContent } from "@/components/ideas/markdown-content";
import { getBusinessIdea, getBusinessIdeas } from "@/lib/content";
import { siteUrl } from "@/lib/env";

export async function generateStaticParams() {
  return (await getBusinessIdeas()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const idea = await getBusinessIdea((await params).slug);
  if (!idea) return {};
  const canonical = `${siteUrl}/ideas/${idea.slug}`;
  const image = idea.cover ? [{ url: idea.cover.public_url, alt: idea.cover.alt_text ?? idea.title }] : undefined;
  return {
    title: idea.meta_title ?? idea.title,
    description: idea.meta_description ?? idea.summary,
    alternates: { canonical },
    openGraph: { type: "article", title: idea.meta_title ?? idea.title, description: idea.meta_description ?? idea.summary, url: canonical, publishedTime: idea.published_at ?? undefined, modifiedTime: idea.updated_at, images: image },
    twitter: { card: "summary_large_image", title: idea.meta_title ?? idea.title, description: idea.meta_description ?? idea.summary, images: image?.map((item) => item.url) },
  };
}

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const idea = await getBusinessIdea((await params).slug);
  if (!idea) notFound();
  const published = idea.published_at ? new Intl.DateTimeFormat("en-ZW", { dateStyle: "long" }).format(new Date(idea.published_at)) : "";
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: idea.title, description: idea.summary, image: idea.cover?.public_url, datePublished: idea.published_at, dateModified: idea.updated_at, author: { "@type": "Organization", name: "Infinity Aura Team" }, mainEntityOfPage: `${siteUrl}/ideas/${idea.slug}` };

  return (
    <article className="idea-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="idea-header"><div className="container idea-header-inner"><Link className="idea-back" href="/ideas"><ArrowLeft size={16} /> All business ideas</Link><div className="idea-meta"><span>{idea.category?.name ?? "Business idea"}</span><span>{published}</span></div><h1>{idea.title}</h1><p>{idea.summary}</p><div className="idea-facts"><span><Coins size={17} /> {idea.investment} investment</span>{idea.launch_time ? <span><Clock3 size={17} /> {idea.launch_time} to launch</span> : null}</div></div></header>
      {idea.cover ? <div className="container idea-cover"><Image src={idea.cover.public_url} alt={idea.cover.alt_text ?? idea.title} fill priority sizes="(max-width: 1000px) 100vw, 1000px" /></div> : null}
      <section className="container idea-body public-idea-preview"><MarkdownContent markdown={idea.preview_markdown} /></section>
      <IdeaDiscussion idea={idea} />
    </article>
  );
}
