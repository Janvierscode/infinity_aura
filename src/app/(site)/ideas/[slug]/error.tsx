"use client";

import Link from "next/link";

export default function IdeaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="centered-state"><span className="section-label">Business idea unavailable</span><h1>We could not open this idea.</h1><p>The content may be temporarily unavailable. Try again, or return to the ideas library.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={reset}>Try again</button><Link className="button button-secondary" href="/ideas">All business ideas</Link></div></section>;
}
