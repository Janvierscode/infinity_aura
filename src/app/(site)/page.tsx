import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { IdeaCard } from "@/components/ideas/idea-card";
import { FuturisticHero } from "@/components/site/futuristic-hero";
import { ServiceCard } from "@/components/site/service-card";
import { getBusinessIdeas, getServices } from "@/lib/content";

export default async function HomePage() {
  const [services, ideas] = await Promise.all([getServices(), getBusinessIdeas()]);
  const featuredServices = services.filter((item) => item.is_featured).slice(0, 4);
  return (
    <>
      <section className="home-hero"><div className="hero-grid" aria-hidden="true" /><div className="container home-hero-layout"><div className="home-hero-copy"><span className="kicker">Practical ideas for ambitious founders</span><h1>Find a business idea worth building.</h1><p>Explore curated opportunities, understand what each takes to launch, and learn from a community that votes, questions, and shares practical experience.</p><div className="hero-actions"><Link className="button button-primary" href="/ideas">Explore business ideas <ArrowRight size={17} /></Link><Link className="button button-secondary" href="/account/signup">Join the community</Link></div><div className="hero-trust"><span><Check size={15} /> Curated opportunities</span><span><Check size={15} /> Practical guidance</span><span><Check size={15} /> Community insight</span></div></div><FuturisticHero /></div><div className="container capability-row"><span>Discover</span><i /><span>Evaluate</span><i /><span>Vote</span><i /><span>Discuss</span><i /><span>Build</span></div></section>
      <section className="section ideas-home-section"><div className="container"><div className="section-heading"><div><span className="section-label">Business Ideas</span><h2>Start with an opportunity you can understand.</h2></div><Link className="text-link" href="/ideas">Explore all ideas <ArrowRight size={16} /></Link></div>{ideas.length ? <div className="idea-grid">{ideas.slice(0, 3).map((idea) => <IdeaCard key={idea.id} idea={idea} />)}</div> : <div className="empty-state"><h2>New opportunities are on the way.</h2><p>The first practical business ideas are being prepared for the community.</p><Link className="button button-secondary" href="/account/signup">Create your account</Link></div>}</div></section>
      <section className="section intro-section section-soft"><div className="container intro-grid"><span className="section-label">Why Infinity Aura</span><div><h2>Ideas become valuable when people can act on them.</h2><p>Infinity Aura brings practical opportunities, thoughtful technology, and useful community context into one professional platform. We help people move from curiosity to informed action, then support organizations that need reliable digital products.</p><Link className="text-link" href="/about">Learn about Infinity Aura <ArrowRight size={16} /></Link></div></div></section>
      <section className="section"><div className="container"><div className="section-heading"><div><span className="section-label">Technology Services</span><h2>When an idea needs the right technology.</h2></div><Link className="text-link" href="/services">View all services <ArrowRight size={16} /></Link></div><div className="service-grid">{featuredServices.map((service) => <ServiceCard key={service.id} href={`/services/${service.slug}`} iconKey={service.icon_key} title={service.title} summary={service.summary} />)}</div></div></section>
      <section className="section"><div className="container simple-cta"><div><span className="section-label">Start a conversation</span><h2>Have an idea worth building?</h2><p>Tell us what you are trying to achieve. We will help define a clear, practical way forward.</p></div><Link className="button button-primary" href="/contact">Contact our team <ArrowRight size={17} /></Link></div></section>
    </>
  );
}
