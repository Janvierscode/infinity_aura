"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { requestPasswordReset, updatePassword } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  return (
    <form className="admin-login-card" action={action}>
      <h1>Recover access</h1>
      <p>Enter the sole administrator email address. Supabase will send a time-limited secure link.</p>
      <label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label>
      {state.message && <div className={`admin-alert ${state.status}`} role="status">{state.message}</div>}
      <button className="button button-primary" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} /> Sending...</> : <>Send recovery link <ArrowRight size={18} /></>}</button>
      <Link className="login-help-link" href="/admin/login">Return to sign in</Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form className="admin-login-card" action={action}>
      <h1>Choose a password</h1>
      <p>Use at least 12 characters. After this step, authenticator verification is still required.</p>
      <label><span>New password</span><input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
      <label><span>Confirm password</span><input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
      {state.message && <div className="admin-alert error" role="alert">{state.message}</div>}
      <button className="button button-primary" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} /> Updating...</> : <>Continue securely <ArrowRight size={18} /></>}</button>
    </form>
  );
}
