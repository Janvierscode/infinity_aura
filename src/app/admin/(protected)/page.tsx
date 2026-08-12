import Link from "next/link";
import { ArrowUpRight, FileText, Inbox, Layers3, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [services, solutions, enquiries, unread, recent] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("solutions").select("id", { count: "exact", head: true }),
    supabase.from("contact_enquiries").select("id", { count: "exact", head: true }),
    supabase.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contact_enquiries").select("id, reference_number, name, email, subject, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const cards = [
    { label: "Services", value: services.count ?? 0, icon: FileText },
    { label: "Solutions", value: solutions.count ?? 0, icon: Layers3 },
    { label: "All enquiries", value: enquiries.count ?? 0, icon: Inbox },
    { label: "New enquiries", value: unread.count ?? 0, icon: Radio },
  ];

  return (
    <><header className="admin-page-header"><div><span>Control centre</span><h1>Good to see you.</h1><p>Here is what needs attention across the Infinity Aura website.</p></div><Link className="button button-secondary" href="/" target="_blank">View website <ArrowUpRight size={17} /></Link></header><section className="admin-metrics">{cards.map(({ label, value, icon: Icon }) => <article key={label}><span><Icon size={19} /></span><strong>{value}</strong><p>{label}</p></article>)}</section><section className="admin-panel"><div className="admin-panel-title"><div><h2>Recent enquiries</h2><p>Latest conversations started from the website.</p></div><Link href="/admin/enquiries">View inbox <ArrowUpRight size={15} /></Link></div>{recent.data?.length ? <div className="admin-table-wrap"><table><thead><tr><th>Reference</th><th>Contact</th><th>Subject</th><th>Status</th><th>Received</th></tr></thead><tbody>{recent.data.map((item) => <tr key={item.id}><td><Link href={`/admin/enquiries?id=${item.id}`}>{item.reference_number}</Link></td><td><strong>{item.name}</strong><small>{item.email}</small></td><td>{item.subject ?? "Website enquiry"}</td><td><span className={`status-pill ${item.status}`}>{item.status.replace("_", " ")}</span></td><td>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(item.created_at))}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No enquiries yet. New website messages will appear here automatically.</div>}</section></>
  );
}
