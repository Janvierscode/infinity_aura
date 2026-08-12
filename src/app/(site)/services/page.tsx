import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/service-card";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Software and Digital Services",
  description: "Explore custom software, web, mobile, AI, cloud, automation, and technology consulting services from Infinity Aura Technologies.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Our services</span><h1>Technology shaped around <span className="gradient-text">your next move.</span></h1><p>We combine strategy, product design, engineering, and ongoing support to build digital systems your organization can own with confidence.</p></div></section>
      <section className="section"><div className="container card-grid">{services.map((service) => <ServiceCard key={service.id} href={`/services/${service.slug}`} iconKey={service.icon_key} title={service.title} summary={service.summary} />)}</div></section>
    </>
  );
}
