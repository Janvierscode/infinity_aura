import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { IdeaEditor } from "@/components/admin/idea-editor";
import { deleteBusinessIdea, moderateComment, saveBusinessIdea } from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";

export default async function EditIdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [idea, categories, media, comments] = await Promise.all([
    supabase.from("business_ideas").select("*").eq("id", id).single(),
    supabase.from("idea_categories").select("*").order("sort_order"),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
    supabase.from("idea_comments").select("*,profile:profiles!idea_comments_user_id_fkey(display_name)").eq("idea_id", id).order("created_at", { ascending: false }),
  ]);

  if (idea.error || !idea.data) notFound();
  if (categories.error || media.error || comments.error) {
    throw new Error("The idea editor could not load all of its supporting content.");
  }

  return (
    <>
      <header className="admin-page-header">
        <div><span>Edit idea</span><h1>{idea.data.title}</h1><p>Update the opportunity, publication details, and community moderation.</p></div>
        <form action={deleteBusinessIdea}>
          <ConfirmSubmitButton className="button button-danger" name="id" value={idea.data.id} label={`Permanently delete ${idea.data.title}`}><Trash2 size={17} /> Delete idea</ConfirmSubmitButton>
        </form>
      </header>
      <IdeaEditor record={idea.data} categories={categories.data ?? []} media={media.data ?? []} action={saveBusinessIdea} />
      <section className="admin-panel idea-moderation">
        <div className="admin-panel-title"><div><h2>Comment moderation</h2><p>Hide comments that need review or delete content permanently.</p></div></div>
        {comments.data?.length ? (
          <div className="simple-list">
            {comments.data.map((comment) => (
              <div className="moderation-row" key={comment.id}>
                <span><strong>{(comment.profile as unknown as { display_name?: string } | null)?.display_name ?? "Community member"}</strong><small>{comment.body}</small></span>
                <span className={`status-pill ${comment.status}`}>{comment.status}</span>
                <form action={moderateComment}>
                  <input type="hidden" name="id" value={comment.id} />
                  <input type="hidden" name="ideaId" value={id} />
                  <button className="button button-quiet" name="intent" value={comment.status === "visible" ? "hidden" : "visible"}>{comment.status === "visible" ? "Hide" : "Restore"}</button>
                  <ConfirmSubmitButton className="icon-button danger" name="intent" value="delete" label="Permanently delete comment"><Trash2 size={15} /></ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        ) : <div className="admin-empty">No comments on this idea.</div>}
      </section>
    </>
  );
}
