import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/service-card";
import { getServices } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "Custom software, web, mobile, AI, automation, cloud, and technology consulting from Infinity Aura Technologies." };
export default async function ServicesPage() { const services = await getServices(); return <><section className="page-hero"><div className="container narrow"><span className="section-label">Our services</span><h1>Digital expertise shaped around your organization.</h1><p>From product strategy to ongoing support, we build clear, maintainable systems around real operating needs.</p></div></section><section className="section"><div className="container service-grid service-index-grid">{services.map((service) => <ServiceCard key={service.id} href={`/services/${service.slug}`} iconKey={service.icon_key} title={service.title} summary={service.summary} />)}</div></section></>; }
