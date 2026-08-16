"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { nextVote } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/server";

export type CommunityActionResult = {
  status: "success" | "error" | "auth_required";
  message: string;
};

async function getMember() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return error || !userId ? null : { supabase, userId };
}

function refreshIdea(slug: string, includeLists = true) {
  const path = `/ideas/${slug}`;
  updateTag(CACHE_TAGS.ideas);
  revalidatePath(path);
  if (includeLists) {
    revalidatePath("/ideas");
    revalidatePath("/");
  }
}

const voteSchema = z.object({
  ideaId: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  value: z.coerce.number().int().refine((value) => value === -1 || value === 1),
});

export async function voteOnIdea(formData: FormData): Promise<CommunityActionResult> {
  const parsed = voteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "That vote could not be validated." };
  const member = await getMember();
  if (!member) return { status: "auth_required", message: "Sign in or create a free account to vote." };

  const existing = await member.supabase.from("idea_votes").select("value").eq("idea_id", parsed.data.ideaId).eq("user_id", member.userId).maybeSingle();
  if (existing.error) return { status: "error", message: "Your current vote could not be checked." };
  const nextValue = nextVote((existing.data?.value as -1 | 1 | undefined) ?? null, parsed.data.value as -1 | 1);
  const result = nextValue === null
    ? await member.supabase.from("idea_votes").delete().eq("idea_id", parsed.data.ideaId).eq("user_id", member.userId)
    : await member.supabase.from("idea_votes").upsert({ idea_id: parsed.data.ideaId, user_id: member.userId, value: nextValue });
  if (result.error) return { status: "error", message: "Your vote could not be saved. Please try again." };

  refreshIdea(parsed.data.slug);
  return { status: "success", message: existing.data?.value === parsed.data.value ? "Your vote was removed." : "Your vote was recorded." };
}

export async function addIdeaComment(formData: FormData): Promise<CommunityActionResult> {
  const parsed = z.object({ ideaId: z.string().uuid(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), body: z.string().trim().min(2).max(2000) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Write a comment between 2 and 2,000 characters." };
  const member = await getMember();
  if (!member) return { status: "auth_required", message: "Sign in or create a free account to comment." };

  const { error } = await member.supabase.from("idea_comments").insert({ idea_id: parsed.data.ideaId, user_id: member.userId, body: parsed.data.body });
  if (error) return { status: "error", message: "Your comment could not be posted. Please try again." };
  updateTag(CACHE_TAGS.comments);
  refreshIdea(parsed.data.slug);
  return { status: "success", message: "Your comment was posted." };
}

export async function deleteOwnComment(formData: FormData): Promise<CommunityActionResult> {
  const parsed = z.object({ id: z.string().uuid(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "That comment could not be validated." };
  const member = await getMember();
  if (!member) return { status: "auth_required", message: "Your session has expired. Sign in again." };

  const { error } = await member.supabase.from("idea_comments").delete().eq("id", parsed.data.id).eq("user_id", member.userId);
  if (error) return { status: "error", message: "Your comment could not be deleted." };
  updateTag(CACHE_TAGS.comments);
  refreshIdea(parsed.data.slug);
  return { status: "success", message: "Your comment was deleted." };
}

export async function voteOnComment(formData: FormData): Promise<CommunityActionResult> {
  const parsed = z.object({ commentId: z.string().uuid(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), value: z.coerce.number().int().refine((value) => value === -1 || value === 1) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "That vote could not be validated." };
  const member = await getMember();
  if (!member) return { status: "auth_required", message: "Sign in or create a free account to vote." };

  const existing = await member.supabase.from("comment_votes").select("value").eq("comment_id", parsed.data.commentId).eq("user_id", member.userId).maybeSingle();
  if (existing.error) return { status: "error", message: "Your current vote could not be checked." };
  const nextValue = nextVote((existing.data?.value as -1 | 1 | undefined) ?? null, parsed.data.value as -1 | 1);
  const result = nextValue === null
    ? await member.supabase.from("comment_votes").delete().eq("comment_id", parsed.data.commentId).eq("user_id", member.userId)
    : await member.supabase.from("comment_votes").upsert({ comment_id: parsed.data.commentId, user_id: member.userId, value: nextValue });
  if (result.error) return { status: "error", message: "Your vote could not be saved. Please try again." };

  updateTag(CACHE_TAGS.comments);
  refreshIdea(parsed.data.slug, false);
  return { status: "success", message: existing.data?.value === parsed.data.value ? "Your vote was removed." : "Your vote was recorded." };
}
