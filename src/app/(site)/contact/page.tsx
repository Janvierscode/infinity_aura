import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { getSiteChrome } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: "Start a software, web, mobile, automation, or AI project with Infinity Aura Technologies." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string; solution?: string }> }) {
  const [query, { settings }] = await Promise.all([searchParams, getSiteChrome()]);
  const selected = query.service ?? query.solution;
  const subject = selected ? selected.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") : undefined;

  return (
    <><section className="page-hero contact-hero"><div className="container"><span className="eyebrow">Let&apos;s build what&apos;s next</span><h1>Have an idea? <span className="gradient-text">Let&apos;s make it real.</span></h1><p>Tell us about the challenge, product, or opportunity you&apos;re exploring. We&apos;ll help define a practical path forward.</p></div></section><section className="section"><div className="container contact-layout"><div className="contact-details"><div><Mail size={21} /><span><small>Email</small><a href={`mailto:${settings.public_email}`}>{settings.public_email}</a></span></div><div><Phone size={21} /><span><small>Phone</small><strong>{settings.phone ?? "Available on request"}</strong></span></div><div><MapPin size={21} /><span><small>Location</small><strong>{settings.city ?? "Harare"}, Zimbabwe</strong></span></div><p>We usually acknowledge new project enquiries within one business day.</p></div><ContactForm subject={subject} /></div></section></>
  );
}
