import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { saveSolution } from "@/features/content/actions";
import { createClient } from "@/lib/supabase/server";
export default async function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createClient(); const { data } = await supabase.from("solutions").select("*").eq("id", id).single(); if (!data) notFound(); return <><header className="admin-page-header"><div><span>Edit solution</span><h1>{data.title}</h1><p>Keep benefits concrete and publish only when ready.</p></div></header><ContentEditor kind="solution" record={data} action={saveSolution} /></>; }
