import type { Metadata } from "next";
import Link from "next/link";
import { IdeaCard } from "@/components/ideas/idea-card";
import { getBusinessIdeas, getIdeaCategories } from "@/lib/content";

export const metadata: Metadata = { title: "Business Ideas", description: "Practical business ideas people can evaluate, discuss, and start, curated by Infinity Aura Technologies." };

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const [{ category, sort = "newest" }, ideas, categories] = await Promise.all([searchParams, getBusinessIdeas(), getIdeaCategories()]);
  const selected = category ? categories.find((item) => item.slug === category) : null;
  const invalidCategory = Boolean(category && !selected);
  const filtered = selected ? ideas.filter((idea) => idea.category?.slug === selected.slug) : invalidCategory ? [] : ideas;
  const sorted = [...filtered].sort((a, b) => sort === "top" ? b.vote_score - a.vote_score : new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());
  const featured = sorted.find((idea) => idea.is_featured) ?? sorted[0];
  const remaining = featured ? sorted.filter((idea) => idea.id !== featured.id) : [];
  return <><section className="page-hero ideas-hero"><div className="container narrow"><span className="section-label">Business Ideas</span><h1>Find a practical idea worth starting.</h1><p>Explore curated opportunities, weigh the investment, and learn from a community of people thinking seriously about business.</p></div></section><section className="idea-filter"><div className="container idea-filter-inner"><nav className="category-nav" aria-label="Business idea categories"><Link className={!category ? "active" : ""} href={`/ideas?sort=${sort}`}>All</Link>{categories.map((item) => <Link className={selected?.id === item.id ? "active" : ""} key={item.id} href={`/ideas?category=${item.slug}&sort=${sort}`}>{item.name}</Link>)}</nav><div className="idea-sort" aria-label="Sort business ideas"><Link className={sort !== "top" ? "active" : ""} href={category ? `/ideas?category=${category}&sort=newest` : "/ideas?sort=newest"}>Newest</Link><Link className={sort === "top" ? "active" : ""} href={category ? `/ideas?category=${category}&sort=top` : "/ideas?sort=top"}>Top voted</Link></div></div></section><section className="section"><div className="container">{invalidCategory ? <div className="empty-state"><h2>Category not found</h2><p>That business idea category is unavailable.</p><Link className="button button-secondary" href="/ideas">View all ideas</Link></div> : featured ? <><IdeaCard idea={featured} featured />{remaining.length > 0 && <div className="idea-grid idea-index-grid">{remaining.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}</div>}</> : <div className="empty-state"><h2>No business ideas yet</h2><p>{selected ? `No published ideas are available in ${selected.name}.` : "The first practical business ideas are being prepared."}</p></div>}</div></section></>;
}
