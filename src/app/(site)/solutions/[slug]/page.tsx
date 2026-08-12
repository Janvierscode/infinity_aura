import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { getSolution, getSolutions } from "@/lib/content";

export async function generateStaticParams() { return (await getSolutions()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const solution = await getSolution((await params).slug);
  return solution ? { title: solution.title, description: solution.summary } : {};
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const solution = await getSolution((await params).slug);
  if (!solution) notFound();
  const benefits = Array.isArray(solution.benefits) ? solution.benefits.filter((item): item is string => typeof item === "string") : [];
  return (
    <><section className="page-hero"><div className="container"><span className="eyebrow">{solution.category ?? "Digital solution"}</span><h1>{solution.title}</h1><p>{solution.summary}</p></div></section><section className="section"><div className="container detail-layout"><article className="prose-panel"><h2>A connected platform for clearer operations</h2><p>{solution.body}</p><ul className="check-list">{benefits.map((benefit) => <li key={benefit}><Check size={18} /> {benefit}</li>)}</ul></article><aside className="detail-cta glass-card"><span>Explore the fit</span><h2>See how this platform can adapt to your organization.</h2><Link className="button button-primary" href={`/contact?solution=${solution.slug}`}>Request a consultation <ArrowRight size={18} /></Link></aside></div></section></>
  );
}
