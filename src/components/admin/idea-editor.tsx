"use client";

import { useActionState, useState } from "react";
import { MarkdownContent } from "@/components/ideas/markdown-content";
import type { CmsActionState } from "@/features/content/cms-actions";
import { slugify } from "@/lib/ideas";
import type { BusinessIdeaRow, IdeaCategoryRow, MediaAssetRow } from "@/types/database";

type IdeaEditorProps = {
  record?: BusinessIdeaRow;
  categories: IdeaCategoryRow[];
  media: MediaAssetRow[];
  action: (state: CmsActionState, formData: FormData) => Promise<CmsActionState>;
};

export function IdeaEditor({ record, categories, media, action }: IdeaEditorProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [title, setTitle] = useState(record?.title ?? "");
  const [slug, setSlug] = useState(record?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(record?.slug));
  const [publicPreview, setPublicPreview] = useState(record?.preview_markdown ?? record?.summary ?? "");
  const [markdown, setMarkdown] = useState(record?.body_markdown ?? "");

  return (
    <form className="idea-editor" action={formAction}>
      {record?.id ? <input type="hidden" name="id" value={record.id} /> : null}
      <section className="editor-panel idea-details">
        <div className="editor-panel-title"><div><h2>Business idea</h2><p>Explain the opportunity honestly, including how someone could begin.</p></div></div>
        <div className="editor-fields">
          <label className="field-wide"><span>Title</span><input name="title" value={title} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(slugify(event.target.value)); }} minLength={2} maxLength={160} required /></label>
          <label><span>URL slug</span><input name="slug" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value); }} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
          <label><span>Category</span><select name="categoryId" defaultValue={record?.category_id ?? categories[0]?.id} required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field-wide"><span>Summary</span><textarea name="summary" rows={3} minLength={20} maxLength={320} defaultValue={record?.summary ?? ""} required /></label>
          <label><span>Starting investment</span><select name="investment" defaultValue={record?.investment ?? "low"}><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option></select></label>
          <label><span>Estimated launch time</span><input name="launchTime" maxLength={80} defaultValue={record?.launch_time ?? ""} placeholder="Example: 2-4 weeks" /></label>
          <label><span>Cover image</span><select name="coverMediaId" defaultValue={record?.cover_media_id ?? ""}><option value="">No cover image</option>{media.map((item) => <option key={item.id} value={item.id}>{item.original_filename}</option>)}</select></label>
          <label className="checkbox-field"><input name="featured" type="checkbox" defaultChecked={record?.is_featured ?? false} /><span>Feature this idea</span></label>
          <label className="field-wide"><span>SEO title</span><input name="metaTitle" maxLength={160} defaultValue={record?.meta_title ?? ""} /></label>
          <label className="field-wide"><span>SEO description</span><textarea name="metaDescription" rows={2} maxLength={320} defaultValue={record?.meta_description ?? ""} /></label>
        </div>
      </section>

      <section className="markdown-workspace preview-workspace">
        <div className="markdown-pane"><label htmlFor="previewMarkdown">Public preview in Markdown</label><textarea id="previewMarkdown" name="previewMarkdown" value={publicPreview} onChange={(event) => setPublicPreview(event.target.value)} minLength={20} maxLength={5000} required spellCheck rows={12} placeholder="Give visitors enough useful context to decide whether to join and continue reading." /></div>
        <div className="markdown-pane preview-pane"><span>Anonymous visitor preview</span><MarkdownContent markdown={publicPreview || "Start writing to preview the public introduction."} compact /></div>
      </section>

      <section className="markdown-workspace">
        <div className="markdown-pane"><label htmlFor="bodyMarkdown">Member-only idea guide in Markdown</label><textarea id="bodyMarkdown" name="bodyMarkdown" value={markdown} onChange={(event) => setMarkdown(event.target.value)} minLength={20} maxLength={100000} required spellCheck rows={28} placeholder={'## The opportunity\n\nExplain the customer problem and how this business can solve it.\n\n## How to start\n\nList practical first steps.'} /></div>
        <div className="markdown-pane preview-pane"><span>Member preview</span><MarkdownContent markdown={markdown || "Start writing to preview the complete business idea."} compact /></div>
      </section>

      <aside className="editor-panel publish-bar">
        <div><strong>Publication</strong><span>{record?.status ? `Currently ${record.status}` : "New draft"}</span>{state.message ? <span className="form-status error" role="alert">{state.message}</span> : null}</div>
        <div className="publish-actions">
          <button className="button button-secondary" name="intent" value="draft" disabled={pending}>{record?.status === "published" ? "Unpublish to draft" : "Save draft"}</button>
          <button className="button button-primary" name="intent" value="published" disabled={pending}>{pending ? "Saving..." : "Publish"}</button>
          {record ? <button className="button button-quiet" name="intent" value="archived" disabled={pending}>Archive</button> : null}
        </div>
      </aside>
    </form>
  );
}
