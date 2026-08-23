import Link from "next/link";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PublicMedia } from "@/components/media/public-media";
import { deleteBusinessIdea, deleteCategory, saveCategory } from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";
import type { PublicMediaAsset } from "@/types/database";

type AdminIdea = {
  id: string;
  title: string;
  slug: string;
  status: string;
  is_featured: boolean;
  vote_score: number;
  comment_count: number;
  updated_at: string;
  category_id: string;
  cover: PublicMediaAsset | null;
};

export default async function IdeasPage() {
  const supabase = await createClient();
  const [ideas, categories] = await Promise.all([
    supabase.from("business_ideas").select("id,title,slug,status,is_featured,vote_score,comment_count,updated_at,category_id,cover:media_assets!business_ideas_cover_media_id_fkey(id,public_url,alt_text,width,height)").order("updated_at", { ascending: false }),
    supabase.from("idea_categories").select("*").order("sort_order").order("name"),
  ]);
  if (ideas.error || categories.error) throw new Error("The business idea workspace could not be loaded.");
  const items = (ideas.data ?? []) as unknown as AdminIdea[];
  const categoryNames = new Map(categories.data?.map((category) => [category.id, category.name]));

  return (
    <>
      <header className="admin-page-header"><div><span>Publishing</span><h1>Business Ideas</h1><p>Create practical opportunities and moderate the community around them.</p></div><Link className="button button-primary" href="/admin/ideas/new"><Plus size={17} /> New idea</Link></header>
      <section className="admin-panel">
        <div className="admin-table-wrap"><table><thead><tr><th>Cover</th><th>Idea</th><th>Category</th><th>Status</th><th>Score</th><th>Comments</th><th>Updated</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><PublicMedia className="admin-idea-thumbnail" media={item.cover} alt={`${item.title} cover`} sizes="64px" /></td><td><strong>{item.title}</strong><small>/ideas/{item.slug}</small></td><td>{categoryNames.get(item.category_id) ?? "Unassigned"}</td><td><span className={`status-pill ${item.status}`}>{item.status}</span>{item.is_featured ? <small>Featured</small> : null}</td><td>{item.vote_score}</td><td>{item.comment_count}</td><td>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(item.updated_at))}</td><td><div className="admin-table-actions"><Link href={`/admin/ideas/${item.id}`}>Edit <ArrowUpRight size={14} /></Link><form action={deleteBusinessIdea}><ConfirmSubmitButton className="icon-button danger" name="id" value={item.id} label={`Permanently delete ${item.title}`}><Trash2 size={15} /></ConfirmSubmitButton></form></div></td></tr>)}</tbody></table></div>
        {!items.length && <div className="admin-empty">No business ideas have been created.</div>}
      </section>
      <section className="editor-panel category-manager">
        <div className="editor-panel-title"><div><h2>Idea categories</h2><p>Keep categories practical and easy for visitors to understand.</p></div></div>
        <div className="category-list">{categories.data?.map((item) => <form action={saveCategory} className="category-row" key={item.id}><input type="hidden" name="id" value={item.id} /><input name="name" defaultValue={item.name} aria-label="Category name" required /><input name="slug" defaultValue={item.slug} aria-label="Category slug" required /><input name="description" defaultValue={item.description ?? ""} aria-label="Category description" /><input name="sortOrder" type="number" min={0} defaultValue={item.sort_order} aria-label="Category order" /><button className="button button-secondary">Save</button><ConfirmSubmitButton className="icon-button danger" formAction={deleteCategory} name="id" value={item.id} label={`Delete ${item.name}`}><Trash2 size={16} /></ConfirmSubmitButton></form>)}</div>
        <form action={saveCategory} className="category-row new-category"><input name="name" placeholder="New category" required /><input name="slug" placeholder="url-slug" required /><input name="description" placeholder="Short description" /><input name="sortOrder" type="number" min={0} defaultValue={100} /><button className="button button-primary">Add category</button></form>
      </section>
    </>
  );
}
