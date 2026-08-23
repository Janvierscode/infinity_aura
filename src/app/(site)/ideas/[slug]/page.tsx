import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Coins } from "lucide-react";
import { notFound } from "next/navigation";
import { IdeaDiscussion } from "@/components/ideas/idea-discussion";
import { MarkdownContent } from "@/components/ideas/markdown-content";
import { PublicMedia } from "@/components/media/public-media";
import { getBusinessIdea, getPublishedIdeaSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/env";

export async function generateStaticParams() {
  return (await getPublishedIdeaSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const idea = await getBusinessIdea((await params).slug);
  if (!idea) return {};
  const canonical = `${siteUrl}/ideas/${idea.slug}`;
  const image = idea.cover ? [{ url: idea.cover.public_url, alt: idea.cover.alt_text ?? idea.title, width: idea.cover.width ?? undefined, height: idea.cover.height ?? undefined }] : undefined;
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
      <header className="idea-header"><div className="container idea-detail-hero"><div className="idea-header-inner"><Link className="idea-back" href="/ideas"><ArrowLeft size={16} /> All business ideas</Link><div className="idea-meta"><span>{idea.category?.name ?? "Business idea"}</span><span>{published}</span></div><h1>{idea.title}</h1><p>{idea.summary}</p><div className="idea-facts"><span><Coins size={17} /> {idea.investment} investment</span>{idea.launch_time ? <span><Clock3 size={17} /> {idea.launch_time} to launch</span> : null}</div></div><PublicMedia className="idea-cover" media={idea.cover} alt={`${idea.title} cover`} priority sizes="(max-width: 860px) 100vw, 48vw" /></div></header>
      <section className="container idea-body public-idea-preview"><MarkdownContent markdown={idea.preview_markdown} /></section>
      <IdeaDiscussion idea={idea} />
    </article>
  );
}
