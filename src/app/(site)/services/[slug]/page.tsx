import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { getService, getServices } from "@/lib/content";

export async function generateStaticParams() { return (await getServices()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const service = await getService((await params).slug); return service ? { title: service.meta_title ?? service.title, description: service.meta_description ?? service.summary } : {}; }
export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) { const service = await getService((await params).slug); if (!service) notFound(); return <><section className="page-hero"><div className="container narrow"><span className="section-label">Infinity Aura service</span><h1>{service.title}</h1><p>{service.summary}</p></div></section><section className="section"><div className="container service-detail"><article className="prose-copy"><h2>Technology designed for the way you work.</h2><p>{service.body}</p><ul className="check-list"><li><Check size={18} /> Discovery grounded in your operating context</li><li><Check size={18} /> Clear delivery stages and communication</li><li><Check size={18} /> Secure, maintainable foundations</li><li><Check size={18} /> Practical handover and dependable support</li></ul></article><aside className="service-cta"><span className="section-label">Discuss this service</span><h2>Let&apos;s define a practical way forward.</h2><Link className="button button-primary" href={`/contact?service=${service.slug}`}>Start a conversation <ArrowRight size={17} /></Link></aside></div></section></>; }
