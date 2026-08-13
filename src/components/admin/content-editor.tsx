import type { ServiceRow } from "@/types/database";

export function ContentEditor({ record, action }: { record?: Partial<ServiceRow>; action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form className="editor-form" action={action}>
      {record?.id && <input type="hidden" name="id" value={record.id} />}
      <section className="editor-panel">
        <div className="editor-panel-title"><h2>Service content</h2><p>Describe the work clearly and keep the promise specific.</p></div>
        <div className="editor-fields">
          <label className="field-wide"><span>Title</span><input name="title" defaultValue={record?.title ?? ""} minLength={2} maxLength={120} required /></label>
          <label><span>URL slug</span><input name="slug" defaultValue={record?.slug ?? ""} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
          <label><span>Icon</span><select name="iconKey" defaultValue={record?.icon_key ?? "code-2"}><option value="code-2">Code</option><option value="panels-top-left">Web platform</option><option value="smartphone">Mobile</option><option value="graduation-cap">Education</option><option value="workflow">Automation</option><option value="brain-circuit">AI</option><option value="cloud">Cloud</option><option value="compass">Consulting</option></select></label>
          <label className="field-wide"><span>Summary</span><textarea name="summary" rows={3} defaultValue={record?.summary ?? ""} minLength={10} maxLength={300} required /></label>
          <label className="field-wide"><span>Detailed content</span><textarea name="body" rows={10} defaultValue={record?.body ?? ""} minLength={20} required /></label>
          <label className="field-wide"><span>SEO title</span><input name="metaTitle" maxLength={160} defaultValue={record?.meta_title ?? ""} /></label>
          <label className="field-wide"><span>SEO description</span><textarea name="metaDescription" rows={2} maxLength={320} defaultValue={record?.meta_description ?? ""} /></label>
        </div>
      </section>
      <aside className="editor-panel editor-publish">
        <div className="editor-panel-title"><h2>Publication</h2><p>Drafts and archived services remain private.</p></div>
        <div className="editor-fields">
          <label><span>Display order</span><input name="sortOrder" type="number" min={0} defaultValue={record?.sort_order ?? 100} required /></label>
          <label className="checkbox-field"><input name="featured" type="checkbox" defaultChecked={record?.is_featured ?? false} /><span>Show on homepage</span></label>
          <button className="button button-secondary" name="intent" value="draft" type="submit">{record?.status === "published" ? "Unpublish to draft" : "Save draft"}</button>
          <button className="button button-primary" name="intent" value="published" type="submit">Publish</button>
          {record && <button className="button button-quiet" name="intent" value="archived" type="submit">Archive</button>}
          {record?.status && <small>Current status: <span className={`status-pill ${record.status}`}>{record.status}</span></small>}
        </div>
      </aside>
    </form>
  );
}
