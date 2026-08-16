"use client";

import { LockKeyhole, MessageCircle, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { AuthGateModal } from "@/components/community/auth-gate-modal";
import { MarkdownContent } from "@/components/ideas/markdown-content";
import { addIdeaComment, deleteOwnComment, voteOnComment, voteOnIdea, type CommunityActionResult } from "@/features/community/actions";
import { createClient } from "@/lib/supabase/client";
import type { BusinessIdeaWithRelations, IdeaCommentWithProfile, MemberIdeaContent } from "@/types/database";

type MemberState =
  | { status: "checking" }
  | { status: "anonymous" }
  | { status: "error"; message: string }
  | { status: "member"; userId: string; content: MemberIdeaContent };

function createFormData(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

export function IdeaDiscussion({ idea }: { idea: BusinessIdeaWithRelations }) {
  const router = useRouter();
  const [member, setMember] = useState<MemberState>({ status: "checking" });
  const [gateOpen, setGateOpen] = useState(false);
  const [feedback, setFeedback] = useState<CommunityActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const next = `/ideas/${idea.slug}#member-content`;

  const loadMemberContent = useCallback(async () => {
    const supabase = createClient();
    const { data: claims, error: claimsError } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (claimsError || !userId) {
      setMember({ status: "anonymous" });
      return;
    }

    const [bodyResult, commentsResult, ideaVoteResult] = await Promise.all([
      supabase.from("business_ideas").select("body_markdown").eq("id", idea.id).eq("status", "published").single(),
      supabase.from("idea_comments").select("id,idea_id,user_id,body,status,upvote_count,downvote_count,vote_score,created_at,updated_at,profile:profiles!idea_comments_user_id_fkey(id,display_name,avatar_url)").eq("idea_id", idea.id).eq("status", "visible").order("vote_score", { ascending: false }).order("created_at", { ascending: true }),
      supabase.from("idea_votes").select("value").eq("idea_id", idea.id).eq("user_id", userId).maybeSingle(),
    ]);

    if (bodyResult.error || !bodyResult.data) {
      setMember({ status: "error", message: "The member guide could not be loaded. Check your connection and try again." });
      return;
    }

    const comments = commentsResult.error ? [] : (commentsResult.data ?? []) as unknown as IdeaCommentWithProfile[];
    const commentVoteResult = comments.length
      ? await supabase.from("comment_votes").select("comment_id,value").eq("user_id", userId).in("comment_id", comments.map((comment) => comment.id))
      : { data: [], error: null };

    if (commentsResult.error || ideaVoteResult.error || commentVoteResult.error) {
      setFeedback({ status: "error", message: "The guide is available, but some discussion details could not be loaded. You can retry by refreshing the page." });
    }

    setMember({
      status: "member",
      userId,
      content: {
        body_markdown: bodyResult.data.body_markdown,
        comments,
        ideaVote: ideaVoteResult.error ? null : (ideaVoteResult.data?.value as -1 | 1 | undefined) ?? null,
        commentVotes: Object.fromEntries((commentVoteResult.data ?? []).map((vote) => [vote.comment_id, vote.value as -1 | 1])),
      },
    });
  }, [idea.id]);

  useEffect(() => {
    const supabase = createClient();
    const initialLoad = window.setTimeout(() => { void loadMemberContent(); }, 0);
    const { data } = supabase.auth.onAuthStateChange(() => { void loadMemberContent(); });
    return () => { window.clearTimeout(initialLoad); data.subscription.unsubscribe(); };
  }, [loadMemberContent]);

  function runAction(action: (formData: FormData) => Promise<CommunityActionResult>, formData: FormData, onSuccess?: () => void) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action(formData);
      setFeedback(result);
      if (result.status === "auth_required") setGateOpen(true);
      if (result.status === "success") {
        onSuccess?.();
        await loadMemberContent();
        router.refresh();
      }
    });
  }

  if (member.status === "checking") {
    return <section className="container member-content-loading" id="member-content" aria-label="Loading member content"><div className="skeleton-glass"><span className="skeleton-line wide" /><span className="skeleton-line" /><span className="skeleton-line medium" /></div></section>;
  }

  if (member.status === "anonymous") {
    return (
      <section className="container idea-member-gate" id="member-content">
        <div className="locked-content-preview" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="member-gate-card">
          <span className="auth-gate-icon" aria-hidden="true"><LockKeyhole size={22} /></span>
          <span className="section-label">Member guide</span>
          <h2>Sign in to continue reading.</h2>
          <p>The complete launch guide and community discussion are available to signed-in members.</p>
          <button className="button button-primary" type="button" onClick={() => setGateOpen(true)}>Continue reading</button>
          <div className="locked-engagement" aria-label={`${idea.upvote_count} upvotes, ${idea.downvote_count} downvotes, ${idea.comment_count} comments`}>
            <button type="button" onClick={() => setGateOpen(true)}><ThumbsUp size={17} /> {idea.upvote_count}</button>
            <button type="button" onClick={() => setGateOpen(true)}><ThumbsDown size={17} /> {idea.downvote_count}</button>
            <button type="button" onClick={() => setGateOpen(true)}><MessageCircle size={17} /> {idea.comment_count}</button>
          </div>
        </div>
        <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} next={next} />
      </section>
    );
  }

  if (member.status === "error") {
    return <section className="container member-load-error" id="member-content"><h2>We could not load the complete guide.</h2><p>{member.message}</p><button className="button button-secondary" type="button" onClick={() => { setMember({ status: "checking" }); void loadMemberContent(); }}>Try again</button></section>;
  }

  const { content, userId } = member;
  return (
    <>
      <section className="container idea-body member-idea-body" id="member-content"><MarkdownContent markdown={content.body_markdown} /></section>
      <section className="container idea-discussion" id="discussion">
        <div className="idea-voting-panel">
          <div><span className="section-label">Community verdict</span><h2>Would you consider starting this business?</h2><p>Vote on the opportunity, then share practical context that helps other founders.</p></div>
          <div className="idea-vote-actions">
            {([1, -1] as const).map((value) => <button key={value} type="button" disabled={pending} className={`vote-button ${content.ideaVote === value ? `active${value === -1 ? " down" : ""}` : value === -1 ? "down" : ""}`} aria-pressed={content.ideaVote === value} onClick={() => runAction(voteOnIdea, createFormData({ ideaId: idea.id, slug: idea.slug, value: String(value) }))}>{value === 1 ? <ThumbsUp size={19} /> : <ThumbsDown size={19} />}<strong>{value === 1 ? idea.upvote_count : idea.downvote_count}</strong><span>{value === 1 ? "Upvote" : "Downvote"}</span></button>)}
          </div>
        </div>
        {feedback ? <div className={`form-status ${feedback.status === "success" ? "success" : "error"}`} role="status">{feedback.message}</div> : null}
        <div className="discussion-header">
          <div><span className="section-label">Discussion</span><h2>{idea.comment_count} {idea.comment_count === 1 ? "comment" : "comments"}</h2></div>
          <form className="comment-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); data.set("ideaId", idea.id); data.set("slug", idea.slug); runAction(addIdeaComment, data, () => form.reset()); }}>
            <label htmlFor="idea-comment">Add a useful comment</label><textarea id="idea-comment" name="body" minLength={2} maxLength={2000} rows={4} placeholder="Share practical experience, local context, questions, or constructive concerns." required />
            <div><small>Keep it respectful and relevant.</small><button className="button button-primary" disabled={pending}><MessageCircle size={16} /> {pending ? "Posting..." : "Post comment"}</button></div>
          </form>
        </div>
        {content.comments.length ? <div className="comment-list">{content.comments.map((comment) => {
          const ownVote = content.commentVotes[comment.id] ?? null;
          return <article className="comment-card" key={comment.id}><header><span className="comment-avatar" aria-hidden="true">{comment.profile?.display_name?.charAt(0).toUpperCase() ?? "M"}</span><div><strong>{comment.profile?.display_name ?? "Community member"}</strong><time dateTime={comment.created_at}>{new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(comment.created_at))}</time></div></header><p>{comment.body}</p><footer>{([1, -1] as const).map((value) => <button key={value} type="button" disabled={pending} className={`comment-vote ${ownVote === value ? `active${value === -1 ? " down" : ""}` : value === -1 ? "down" : ""}`} aria-label={`${value === 1 ? "Upvote" : "Downvote"} comment`} aria-pressed={ownVote === value} onClick={() => runAction(voteOnComment, createFormData({ commentId: comment.id, slug: idea.slug, value: String(value) }))}>{value === 1 ? <ThumbsUp size={15} /> : <ThumbsDown size={15} />} {value === 1 ? comment.upvote_count : comment.downvote_count}</button>)}<span className="comment-score">Score {comment.vote_score}</span>{userId === comment.user_id ? <button className="comment-delete-button" type="button" disabled={pending} onClick={() => { if (window.confirm("Permanently delete your comment?")) runAction(deleteOwnComment, createFormData({ id: comment.id, slug: idea.slug })); }}><Trash2 size={15} /> Delete</button> : null}</footer></article>;
        })}</div> : <div className="empty-state">No comments yet. Start a useful conversation about this idea.</div>}
      </section>
    </>
  );
}
