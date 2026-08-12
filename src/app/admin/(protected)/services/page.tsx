import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("id, title, slug, status, is_featured, sort_order, updated_at").order("sort_order");
  return <><header className="admin-page-header"><div><span>Website content</span><h1>Services</h1><p>Manage service pages, ordering, featured state, and publication.</p></div><Link className="button button-primary" href="/admin/services/new"><Plus size={17} /> Add service</Link></header><section className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Service</th><th>Status</th><th>Featured</th><th>Order</th><th>Updated</th><th /></tr></thead><tbody>{data?.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>/{item.slug}</small></td><td><span className={`status-pill ${item.status}`}>{item.status}</span></td><td>{item.is_featured ? "Yes" : "No"}</td><td>{item.sort_order}</td><td>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(item.updated_at))}</td><td><Link href={`/admin/services/${item.id}`}>Edit <ArrowUpRight size={14} /></Link></td></tr>)}</tbody></table></div>{!data?.length && <div className="admin-empty">No services have been created.</div>}</section></>;
}
