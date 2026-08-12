import { RotateCcw } from "lucide-react";
import { restoreRevision } from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";

export default async function RevisionsPage() {
  const supabase = await createClient(); const { data } = await supabase.from("content_revisions").select("*").order("created_at", { ascending: false }).limit(100);
  return <><header className="admin-page-header"><div><span>Content safety</span><h1>Revision history</h1><p>Review immutable snapshots and restore supported content as a new draft.</p></div></header><section className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Content</th><th>Revision</th><th>Summary</th><th>Created</th><th /></tr></thead><tbody>{data?.map((item) => <tr key={item.id}><td><strong>{item.entity_type.replace("_", " ")}</strong><small>{item.entity_id}</small></td><td>#{item.revision_number}</td><td>{item.change_summary ?? "Content saved"}</td><td>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</td><td>{["service", "solution", "page", "page_section", "testimonial"].includes(item.entity_type) ? <form action={restoreRevision}><button className="button button-secondary" name="revisionId" value={item.id}><RotateCcw size={14} /> Restore draft</button></form> : <span className="muted-small">View only</span>}</td></tr>)}</tbody></table></div>{!data?.length && <div className="admin-empty">Revisions appear after content is saved.</div>}</section></>;
}
