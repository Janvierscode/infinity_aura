"use client";

import { useActionState } from "react";
import { requestMemberPasswordReset, updateMemberPassword, updateMemberProfile } from "@/features/community/auth-actions";

function Status({ state }: { state: { status?: "success" | "error"; message?: string } }) {
  return state.message ? <div className={`form-status ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</div> : null;
}

export function MemberRecoveryForm() {
  const [state, action, pending] = useActionState(requestMemberPasswordReset, {});
  return <form className="member-auth-form" action={action}><label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label><Status state={state} /><button className="button button-primary" disabled={pending}>{pending ? "Sending..." : "Send recovery link"}</button></form>;
}

export function MemberPasswordForm() {
  const [state, action, pending] = useActionState(updateMemberPassword, {});
  return <form className="member-auth-form" action={action}><label><span>New password</span><input name="password" type="password" minLength={12} autoComplete="new-password" required /></label><label><span>Confirm password</span><input name="confirmPassword" type="password" minLength={12} autoComplete="new-password" required /></label><Status state={state} /><button className="button button-primary" disabled={pending}>{pending ? "Updating..." : "Update password"}</button></form>;
}

export function MemberProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateMemberProfile, {});
  return <form className="member-auth-form" action={action}><label><span>Public display name</span><input name="displayName" defaultValue={displayName} minLength={2} maxLength={80} autoComplete="name" required /></label><Status state={state} /><button className="button button-primary" disabled={pending}>{pending ? "Saving..." : "Save profile"}</button></form>;
}
