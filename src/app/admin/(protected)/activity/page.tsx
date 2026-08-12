import { createClient } from "@/lib/supabase/server";

export default async function ActivityPage() {
  const supabase = await createClient(); const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
  return <><header className="admin-page-header"><div><span>Accountability</span><h1>Activity log</h1><p>An append-only record of important content, enquiry, media, and settings changes.</p></div></header><section className="activity-list">{data?.map((item) => <article key={item.id}><span className="activity-dot" /><div><strong>{item.action.replaceAll(".", " ")}</strong><p>{item.entity_type.replace("_", " ")}{item.entity_id ? ` · ${item.entity_id}` : ""}</p></div><time dateTime={item.created_at}>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</time></article>)}{!data?.length && <div className="admin-empty admin-panel">No activity has been recorded.</div>}</section></>;
}
