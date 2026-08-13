"use client";

import { useActionState } from "react";
import { signInMember, signUpMember, type MemberAuthState } from "@/features/community/auth-actions";

export function MemberAuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const action = mode === "login" ? signInMember : signUpMember;
  const [state, formAction, pending] = useActionState<MemberAuthState, FormData>(action, {});
  return <form className="member-auth-form" action={formAction}><input type="hidden" name="next" value={next} />{mode === "signup" && <label><span>Display name</span><input name="displayName" minLength={2} maxLength={80} autoComplete="name" required /></label>}<label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label><label><span>Password</span><input name="password" type="password" minLength={12} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>{state.message && <div className={`form-status ${state.status}`} role="status">{state.message}</div>}<button className="button button-primary" disabled={pending}>{pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form>;
}
