"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { login } from "@/features/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form className="admin-login-card" action={action}>
      <span className="admin-login-icon"><LockKeyhole size={23} /></span>
      <h1>Administrator access</h1>
      <p>Sign in with the private Infinity Aura administrator account.</p>
      <label><span>Email address</span><input name="email" type="email" autoComplete="username" required /></label>
      <label><span>Password</span><input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
      {state.error && <div className="admin-alert error" role="alert">{state.error}</div>}
      <button className="button button-primary" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} /> Verifying...</> : <>Sign in securely <ArrowRight size={18} /></>}</button>
      <small>Access is restricted to one authorized administrator.</small>
    </form>
  );
}
