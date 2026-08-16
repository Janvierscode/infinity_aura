"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";
import { useEffect, useRef } from "react";

type AuthGateModalProps = {
  open: boolean;
  onClose: () => void;
  next: string;
};

export function AuthGateModal({ open, onClose, next }: AuthGateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="auth-gate-dialog" onClose={onClose} aria-labelledby="auth-gate-title" aria-describedby="auth-gate-description">
      <button className="auth-gate-close" type="button" onClick={onClose} aria-label="Close sign-in dialog"><X size={19} /></button>
      <span className="auth-gate-icon" aria-hidden="true"><LockKeyhole size={22} /></span>
      <h2 id="auth-gate-title">Continue with a free account.</h2>
      <p id="auth-gate-description">Sign in to read the complete business guide, see the discussion, vote, and share your own practical experience.</p>
      <div className="auth-gate-actions">
        <Link className="button button-primary" href={`/account/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
        <Link className="button button-secondary" href={`/account/signup?next=${encodeURIComponent(next)}`}>Create account</Link>
      </div>
      <small>Your account is free. We only use it to protect community participation and member content.</small>
    </dialog>
  );
}
