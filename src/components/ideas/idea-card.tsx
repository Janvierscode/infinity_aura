import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, ThumbsUp } from "lucide-react";
import type { BusinessIdeaWithRelations } from "@/types/database";

export function IdeaCard({ idea, featured = false }: { idea: BusinessIdeaWithRelations; featured?: boolean }) {
  const date = idea.published_at ? new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(idea.published_at)) : "";
  return (
    <article className={featured ? "idea-card featured" : "idea-card"}>
      {idea.cover && <Link className="idea-card-image" href={`/ideas/${idea.slug}`}><Image src={idea.cover.public_url} alt={idea.cover.alt_text ?? ""} fill sizes={featured ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 700px) 100vw, 33vw"} /></Link>}
      <div className="idea-card-copy">
        <div className="idea-meta"><span>{idea.category?.name ?? "Business idea"}</span><span>{idea.investment} investment</span><span>{date}</span></div>
        {featured ? <h2><Link href={`/ideas/${idea.slug}`}>{idea.title}</Link></h2> : <h3><Link href={`/ideas/${idea.slug}`}>{idea.title}</Link></h3>}
        <p>{idea.summary}</p>
        <div className="idea-card-footer"><Link className="text-link" href={`/ideas/${idea.slug}`}>Explore idea <ArrowUpRight size={16} /></Link><span><ThumbsUp size={14} /> {idea.vote_score}</span><span><MessageCircle size={14} /> {idea.comment_count}</span></div>
      </div>
    </article>
  );
}
