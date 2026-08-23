import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IdeaCard } from "@/components/ideas/idea-card";
import { getBusinessIdeaPage, getIdeaCategories, type IdeaSort } from "@/lib/content";

export const metadata: Metadata = { title: "Business Ideas", description: "Practical business ideas people can evaluate, discuss, and start, curated by Infinity Aura Technologies." };

function ideasUrl(category: string | undefined, sort: IdeaSort, page?: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (sort !== "newest") params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/ideas?${query}` : "/ideas";
}

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; page?: string }> }) {
  const [{ category, sort: requestedSort, page: requestedPage }, categories] = await Promise.all([searchParams, getIdeaCategories()]);
  const sort: IdeaSort = requestedSort === "top" ? "top" : "newest";
  const page = Math.max(1, Number.parseInt(requestedPage ?? "1", 10) || 1);
  const selected = category ? categories.find((item) => item.slug === category) : null;
  const invalidCategory = Boolean(category && !selected);
  const result = invalidCategory ? { items: [], page, pageSize: 9, total: 0, totalPages: 0 } : await getBusinessIdeaPage(selected?.id ?? null, sort, page);
  if (!invalidCategory && result.totalPages > 0 && page > result.totalPages) redirect(ideasUrl(category, sort, result.totalPages));
  const featured = page === 1 ? result.items[0] : null;
  const remaining = featured ? result.items.slice(1) : result.items;

  return <><section className="page-hero ideas-hero"><div className="container narrow"><span className="section-label">Business Ideas</span><h1>Find a practical idea worth starting.</h1><p>Explore curated opportunities, weigh the investment, and learn from a community of people thinking seriously about business.</p></div></section><section className="idea-filter"><div className="container idea-filter-inner"><nav className="category-nav" aria-label="Business idea categories"><Link className={!category ? "active" : ""} href={ideasUrl(undefined, sort)}>All</Link>{categories.map((item) => <Link className={selected?.id === item.id ? "active" : ""} key={item.id} href={ideasUrl(item.slug, sort)}>{item.name}</Link>)}</nav><div className="idea-sort" aria-label="Sort business ideas"><Link className={sort === "newest" ? "active" : ""} href={ideasUrl(category, "newest")}>Newest</Link><Link className={sort === "top" ? "active" : ""} href={ideasUrl(category, "top")}>Top voted</Link></div></div></section><section className="section"><div className="container">{invalidCategory ? <div className="empty-state"><h2>Category not found</h2><p>That business idea category is unavailable.</p><Link className="button button-secondary" href="/ideas">View all ideas</Link></div> : featured ? <><IdeaCard idea={featured} featured priority />{remaining.length > 0 && <div className="idea-grid idea-index-grid">{remaining.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}</div>}</> : remaining.length ? <div className="idea-grid">{remaining.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}</div> : <div className="empty-state"><h2>No business ideas yet</h2><p>{selected ? `No published ideas are available in ${selected.name}.` : "The first practical business ideas are being prepared."}</p></div>}{result.totalPages > 1 ? <nav className="pagination" aria-label="Business idea pages"><Link className={page <= 1 ? "disabled" : ""} aria-disabled={page <= 1} href={ideasUrl(category, sort, Math.max(1, page - 1))}>Previous</Link><span>Page {page} of {result.totalPages}</span><Link className={page >= result.totalPages ? "disabled" : ""} aria-disabled={page >= result.totalPages} href={ideasUrl(category, sort, Math.min(result.totalPages, page + 1))}>Next</Link></nav> : null}</div></section></>;
}
