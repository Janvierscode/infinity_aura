import { notFound } from "next/navigation";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";
import { createClient } from "@/lib/supabase/server";
export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createClient(); const { data } = await supabase.from("testimonials").select("*").eq("id", id).single(); if (!data) notFound(); return <><header className="admin-page-header"><div><span>Edit feedback</span><h1>{data.person_name}</h1><p>Review the wording and approval state carefully.</p></div></header><TestimonialEditor record={data} /></>; }
