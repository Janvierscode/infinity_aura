"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="centered-state"><span className="section-label">Temporary problem</span><h1>This page could not be loaded.</h1><p>Please try again. Your account and submitted information have not been changed.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={reset}>Try again</button><Link className="button button-secondary" href="/">Return home</Link></div></section>;
}
