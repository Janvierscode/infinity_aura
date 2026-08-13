"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache-tags";

async function requireMember(next: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return { supabase, userId };
}

export async function voteOnIdea(formData: FormData) {
  const parsed = z.object({ ideaId: z.string().uuid(), slug: z.string(), value: z.coerce.number().int().min(-1).max(1) }).parse(Object.fromEntries(formData.entries()));
  if (parsed.value === 0) throw new Error("Invalid vote.");
  const path = `/ideas/${parsed.slug}`;
  const { supabase, userId } = await requireMember(path);
  const existing = await supabase.from("idea_votes").select("value").eq("idea_id", parsed.ideaId).eq("user_id", userId).maybeSingle();
  const result = existing.data?.value === parsed.value
    ? await supabase.from("idea_votes").delete().eq("idea_id", parsed.ideaId).eq("user_id", userId)
    : await supabase.from("idea_votes").upsert({ idea_id: parsed.ideaId, user_id: userId, value: parsed.value as -1 | 1 });
  if (result.error) throw new Error("Your vote could not be saved.");
  updateTag(CACHE_TAGS.ideas);
  revalidatePath(path); revalidatePath("/ideas"); revalidatePath("/");
}

export async function addIdeaComment(formData: FormData) {
  const parsed = z.object({ ideaId: z.string().uuid(), slug: z.string(), body: z.string().trim().min(2).max(2000) }).parse(Object.fromEntries(formData.entries()));
  const path = `/ideas/${parsed.slug}`;
  const { supabase, userId } = await requireMember(path);
  const { error } = await supabase.from("idea_comments").insert({ idea_id: parsed.ideaId, user_id: userId, body: parsed.body });
  if (error) throw new Error("Your comment could not be posted.");
  updateTag(CACHE_TAGS.comments);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath(path); revalidatePath("/ideas");
}

export async function deleteOwnComment(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), slug: z.string() }).parse(Object.fromEntries(formData.entries()));
  const path = `/ideas/${parsed.slug}`;
  const { supabase, userId } = await requireMember(path);
  const { error } = await supabase.from("idea_comments").delete().eq("id", parsed.id).eq("user_id", userId);
  if (error) throw new Error("Your comment could not be deleted.");
  updateTag(CACHE_TAGS.comments);
  updateTag(CACHE_TAGS.ideas);
  revalidatePath(path); revalidatePath("/ideas");
}

export async function voteOnComment(formData: FormData) {
  const parsed = z.object({ commentId: z.string().uuid(), slug: z.string(), value: z.coerce.number().int().min(-1).max(1) }).parse(Object.fromEntries(formData.entries()));
  if (parsed.value === 0) throw new Error("Invalid vote.");
  const path = `/ideas/${parsed.slug}`;
  const { supabase, userId } = await requireMember(path);
  const existing = await supabase.from("comment_votes").select("value").eq("comment_id", parsed.commentId).eq("user_id", userId).maybeSingle();
  const result = existing.data?.value === parsed.value
    ? await supabase.from("comment_votes").delete().eq("comment_id", parsed.commentId).eq("user_id", userId)
    : await supabase.from("comment_votes").upsert({ comment_id: parsed.commentId, user_id: userId, value: parsed.value as -1 | 1 });
  if (result.error) throw new Error("Your vote could not be saved.");
  updateTag(CACHE_TAGS.comments);
  revalidatePath(path);
}
