"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { submitContactEnquiry, type ContactFormState } from "@/features/enquiries/actions";

const initialContactState: ContactFormState = { status: "idle", message: "" };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="field-error">{messages[0]}</span>;
}

export function ContactForm({ subject }: { subject?: string }) {
  const [state, action, pending] = useActionState(submitContactEnquiry, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} className="contact-form glass-card" action={action} noValidate>
      <input type="hidden" name="sourcePath" value="/contact" />
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-title"><span>Start a conversation</span><i /></div>
      <div className="form-grid">
        <label><span>Full name *</span><input name="name" type="text" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(state.errors?.name)} required /><FieldError messages={state.errors?.name} /></label>
        <label><span>Email address *</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(state.errors?.email)} required /><FieldError messages={state.errors?.email} /></label>
        <label><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" placeholder="+263" aria-invalid={Boolean(state.errors?.phone)} /><FieldError messages={state.errors?.phone} /></label>
        <label><span>Organization</span><input name="organization" type="text" autoComplete="organization" placeholder="Company or institution" /></label>
        <label className="field-wide"><span>What can we help with?</span><input name="subject" type="text" defaultValue={subject} placeholder="Brief project subject" /></label>
        <label className="field-wide"><span>Message *</span><textarea name="message" rows={6} placeholder="Tell us about the challenge, product, or opportunity..." aria-invalid={Boolean(state.errors?.message)} required /><FieldError messages={state.errors?.message} /></label>
      </div>
      <button className="button button-primary form-button" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} /> Sending securely...</> : <>Send message <ArrowRight size={18} /></>}</button>
      <div className={`form-status ${state.status}`} role="status" aria-live="polite">{state.message}{state.reference && <small> Reference: {state.reference}</small>}</div>
      <p className="form-note">Your enquiry is stored securely and delivered automatically to Infinity Aura Technologies. No email application will open.</p>
    </form>
  );
}
