import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { getService, getServices } from "@/lib/content";

export async function generateStaticParams() {
  return (await getServices()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service ? { title: service.title, description: service.summary } : {};
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Infinity Aura service</span><h1>{service.title}</h1><p>{service.summary}</p></div></section>
      <section className="section"><div className="container detail-layout"><article className="prose-panel"><h2>Digital capability designed for your organization</h2><p>{service.body}</p><ul className="check-list"><li><Check size={18} /> Discovery grounded in your real operating context</li><li><Check size={18} /> Clear delivery stages and transparent communication</li><li><Check size={18} /> Secure, maintainable foundations built to evolve</li><li><Check size={18} /> Practical handover and dependable ongoing support</li></ul></article><aside className="detail-cta glass-card"><span>Discuss this service</span><h2>Let&apos;s turn the opportunity into a practical plan.</h2><Link className="button button-primary" href={`/contact?service=${service.slug}`}>Start a conversation <ArrowRight size={18} /></Link></aside></div></section>
    </>
  );
}
