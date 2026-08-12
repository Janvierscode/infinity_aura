import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { saveService } from "@/features/content/actions";
import { createClient } from "@/lib/supabase/server";
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createClient(); const { data } = await supabase.from("services").select("*").eq("id", id).single(); if (!data) notFound(); return <><header className="admin-page-header"><div><span>Edit service</span><h1>{data.title}</h1><p>Changes remain private until you publish them.</p></div></header><ContentEditor kind="service" record={data} action={saveService} /></>; }
