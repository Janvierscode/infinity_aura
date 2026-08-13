import { IdeaEditor } from "@/components/admin/idea-editor";
import { saveBusinessIdea } from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";
export default async function NewIdeaPage() { const supabase = await createClient(); const [categories, media] = await Promise.all([supabase.from("idea_categories").select("*").order("sort_order"), supabase.from("media_assets").select("*").order("created_at", { ascending: false })]); return <><header className="admin-page-header"><div><span>New opportunity</span><h1>Create a business idea.</h1><p>Start as a draft, explain the opportunity clearly, and publish when it is useful.</p></div></header><IdeaEditor categories={categories.data ?? []} media={media.data ?? []} action={saveBusinessIdea} /></>; }
