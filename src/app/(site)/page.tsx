import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, CircleCheck, Sparkles } from "lucide-react";
import { ServiceCard } from "@/components/site/service-card";
import { SolutionCard } from "@/components/site/solution-card";
import { getHomeSections, getServices, getSolutions, getTechnologyGroups, getTestimonials } from "@/lib/content";

export default async function HomePage() {
  const [services, solutions, technologyGroups, testimonials, sections] = await Promise.all([getServices(), getSolutions(), getTechnologyGroups(), getTestimonials(), getHomeSections()]);
  const section = new Map(sections.map((item) => [item.section_key, item]));
  const hero = section.get("hero")!;
  const about = section.get("about")!;
  const servicesSection = section.get("services")!;
  const solutionsSection = section.get("solutions")!;
  const technologySection = section.get("technologies")!;
  const cta = section.get("cta")!;

  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="hero-eyebrow"><span /> {hero.eyebrow}</div>
            <h1>{hero.heading} <span>{hero.accent_text}</span></h1>
            <p>{hero.body}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={hero.primary_cta_url ?? "/contact"}>{hero.primary_cta_label ?? "Start your project"} <ArrowRight size={18} /></Link>
              <Link className="button button-secondary" href={hero.secondary_cta_url ?? "/services"}>{hero.secondary_cta_label ?? "Explore our work"}</Link>
            </div>
            <div className="hero-trust">
              <span><Check size={15} /> Strategy-led</span>
              <span><Check size={15} /> Built to scale</span>
              <span><Check size={15} /> Local insight</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Infinity Aura digital systems illustration">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="hero-logo"><div /><Image src="/brand/infinity-aura-icon.jpg" alt="Infinity Aura Technologies emblem" width={640} height={640} priority /></div>
            <div className="floating-pill pill-one"><Sparkles size={17} /> Intelligent systems</div>
            <div className="floating-pill pill-two"><span /> Platform online</div>
            <div className="code-window glass-card">
              <div><i /><i /><i /><small>build.ts</small></div>
              <code><b>const</b> future = <em>await</em> create(&#123;<br />&nbsp;&nbsp;vision, craft, impact<br />&#125;);</code>
            </div>
          </div>
        </div>
        <div className="container capability-row"><span>Software</span><i /><span>Web Platforms</span><i /><span>Mobile Apps</span><i /><span>AI Solutions</span><i /><span>Transformation</span></div>
      </section>

      <section className="section about-home">
        <div className="container about-grid">
          <div className="section-heading">
            <span className="eyebrow">{about.eyebrow}</span>
            <h2>{about.heading} <span className="gradient-text">{about.accent_text}</span></h2>
          </div>
          <div className="about-lead">
            <p>{about.body}</p>
            <Link className="card-link" href={about.primary_cta_url ?? "/about"}>{about.primary_cta_label ?? "Discover our company"} <ArrowUpRight size={16} /></Link>
          </div>
          <article className="purpose-card"><span>01</span><h3>Our mission</h3><p>To deliver innovative technology solutions that empower organizations and transform ideas into reality.</p></article>
          <article className="purpose-card"><span>02</span><h3>Our vision</h3><p>To become a leading African technology company recognized for innovation, excellence, and impact.</p></article>
        </div>
      </section>

      <section className="section section-muted" id="services">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">{servicesSection.eyebrow}</span>
            <h2>{servicesSection.heading} <span className="gradient-text">{servicesSection.accent_text}</span></h2>
            <p>{servicesSection.body}</p>
          </div>
          <div className="card-grid">
            {services.map((service) => <ServiceCard key={service.id} href={`/services/${service.slug}`} iconKey={service.icon_key} title={service.title} summary={service.summary} />)}
          </div>
        </div>
      </section>

      <section className="section impact-section">
        <div className="container impact-grid">
          <div className="section-heading">
            <span className="eyebrow">Why Infinity Aura</span>
            <h2>Built around the outcome, <span className="gradient-text">not the buzzword.</span></h2>
            <p>We combine disciplined engineering, transparent collaboration, and a practical understanding of African operating environments.</p>
            <Link className="button button-secondary" href="/contact">Talk to our team <ArrowUpRight size={17} /></Link>
          </div>
          <div className="metric-grid">
            <article><strong>100<span>%</span></strong><p>Client focus at every stage</p></article>
            <article><strong>24<span>/7</span></strong><p>Systems designed for reliability</p></article>
            <article><strong>∞</strong><p>Scalable thinking from day one</p></article>
            <article><strong><CircleCheck size={47} /></strong><p>Support you can count on</p></article>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">{solutionsSection.eyebrow}</span>
            <h2>{solutionsSection.heading} <span className="gradient-text">{solutionsSection.accent_text}</span></h2>
          </div>
          <div className="solutions-grid">
            {solutions.map((solution, index) => <SolutionCard key={solution.id} href={`/solutions/${solution.slug}`} category={solution.category} title={solution.title} summary={solution.summary} index={index} />)}
          </div>
        </div>
      </section>

      <section className="section tech-section">
        <div className="container">
          <div className="section-heading center">
            <span className="eyebrow">{technologySection.eyebrow}</span>
            <h2>{technologySection.heading} <span className="gradient-text">{technologySection.accent_text}</span></h2>
            <p>{technologySection.body}</p>
          </div>
          <div className="tech-grid">
            {technologyGroups.map((group) => <article key={group.id}><span>{group.name}</span>{group.items.map((item) => <strong key={item}>{item}</strong>)}</article>)}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && <section className="section section-muted"><div className="container"><div className="section-heading center"><span className="eyebrow">Client perspective</span><h2>Trust earned through <span className="gradient-text">useful outcomes.</span></h2></div><div className="testimonial-grid">{testimonials.map((item) => <figure className="testimonial-card" key={item.id}><blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.person_name}</strong><span>{[item.person_role, item.organization].filter(Boolean).join(" · ")}</span></figcaption></figure>)}</div></div></section>}

      <section className="section cta-section">
        <div className="container cta-panel">
          <div><span className="eyebrow">{cta.eyebrow}</span><h2>{cta.heading}</h2></div>
          <Link className="button button-primary" href={cta.primary_cta_url ?? "/contact"}>{cta.primary_cta_label ?? "Start a project"} <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
