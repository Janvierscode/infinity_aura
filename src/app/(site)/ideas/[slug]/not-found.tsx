import Link from "next/link";

export default function IdeaNotFound() {
  return (
    <section className="centered-state">
      <span className="section-label">Business idea not found</span>
      <h1>This idea is not available.</h1>
      <p>It may be unpublished, removed, or the address may be incorrect.</p>
      <Link className="button button-primary" href="/ideas">Explore business ideas</Link>
    </section>
  );
}
