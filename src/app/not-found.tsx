import Link from "next/link";
export default function NotFound() { return <main className="centered-state"><span>404</span><h1>This page is outside the map.</h1><p>The address may have changed, or the content may no longer be available.</p><Link className="button button-primary" href="/">Return home</Link></main>; }
