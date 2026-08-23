import Link from "next/link";
import { ArrowUpRight, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { PublicMedia } from "@/components/media/public-media";
import type { BusinessIdeaCard as BusinessIdeaCardType } from "@/types/database";

export function IdeaCard({ idea, featured = false, priority = false }: { idea: BusinessIdeaCardType; featured?: boolean; priority?: boolean }) {
  const date = idea.published_at ? new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(idea.published_at)) : "";
  return (
    <article className={featured ? "idea-card featured" : "idea-card"}>
      <Link className="idea-card-image" href={`/ideas/${idea.slug}`} aria-label={`Explore ${idea.title}`}>
        <PublicMedia media={idea.cover} alt={`${idea.title} cover`} priority={priority} sizes={featured ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"} />
        {featured ? <span className="idea-featured-badge">Featured idea</span> : null}
      </Link>
      <div className="idea-card-copy">
        <div className="idea-meta"><span>{idea.category?.name ?? "Business idea"}</span><span>{idea.investment} investment</span></div>
        {featured ? <h2><Link href={`/ideas/${idea.slug}`}>{idea.title}</Link></h2> : <h3><Link href={`/ideas/${idea.slug}`}>{idea.title}</Link></h3>}
        <p>{idea.summary}</p>
        <div className="idea-card-footer"><Link className="text-link" href={`/ideas/${idea.slug}`}>Explore idea <ArrowUpRight size={16} /></Link><time dateTime={idea.published_at ?? undefined}>{date}</time><span title={`${idea.upvote_count} upvotes`}><ThumbsUp size={14} /> {idea.upvote_count}</span><span title={`${idea.downvote_count} downvotes`}><ThumbsDown size={14} /> {idea.downvote_count}</span><span title={`${idea.comment_count} comments`}><MessageCircle size={14} /> {idea.comment_count}</span></div>
      </div>
    </article>
  );
}
