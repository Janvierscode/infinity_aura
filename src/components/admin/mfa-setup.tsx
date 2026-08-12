"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Enrolment = { factorId: string; qrCode: string; secret: string };

export function MfaSetup({ hasVerifiedFactor }: { hasVerifiedFactor: boolean }) {
  const router = useRouter();
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hasVerifiedFactor) return;
    const supabase = createClient();
    supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Infinity Aura Admin" }).then(({ data, error: enrollError }) => {
      if (enrollError) setError(enrollError.message);
      if (data) setEnrolment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
    });
  }, [hasVerifiedFactor]);

  async function verify() {
    setBusy(true); setError("");
    const supabase = createClient();
    const factorId = enrolment?.factorId ?? (await supabase.auth.mfa.listFactors()).data?.totp.find((factor) => factor.status === "verified")?.id;
    if (!factorId) { setError("No authenticator factor is available."); setBusy(false); return; }
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) { setError(challenge.error.message); setBusy(false); return; }
    const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code: code.trim() });
    if (result.error) { setError("That code could not be verified. Wait for a fresh code and try again."); setBusy(false); return; }
    router.replace("/admin"); router.refresh();
  }

  return <section className="mfa-card"><span className="mfa-icon">{hasVerifiedFactor ? <LockKeyhole size={24} /> : <ShieldCheck size={24} />}</span><h1>{hasVerifiedFactor ? "Verify your identity" : "Secure the administrator"}</h1><p>{hasVerifiedFactor ? "Enter the current six-digit code from your authenticator app." : "Scan this QR code with an authenticator app. MFA is mandatory before any CMS data can be accessed."}</p>{enrolment && <div className="mfa-qr"><Image src={enrolment.qrCode} alt="Authenticator enrollment QR code" width={220} height={220} unoptimized /><small>Manual key</small><code>{enrolment.secret}</code></div>}<label><span>Six-digit verification code</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" /></label>{error && <div className="admin-alert error" role="alert">{error}</div>}<button className="button button-primary" type="button" onClick={verify} disabled={busy || code.length !== 6}>{busy ? <><LoaderCircle className="spin" size={18} /> Verifying...</> : "Verify and continue"}</button></section>;
}
