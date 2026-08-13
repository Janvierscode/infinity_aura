import Image from "next/image";
import Link from "next/link";

const companyLinks = [{ label: "Business Ideas", href: "/ideas" }, { label: "About", href: "/about" }, { label: "Services", href: "/services" }, { label: "Contact", href: "/contact" }];
const legalLinks = [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }];

export function SiteFooter({ settings }: { settings: { tagline: string; public_email: string; city: string | null } }) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="brand" href="/"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={42} height={42} /><span><strong>Infinity Aura</strong><small>Technologies</small></span></Link>
          <p>{settings.tagline}</p>
        </div>
        <div className="footer-links"><strong>Company</strong>{companyLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
        <div className="footer-links"><strong>Contact</strong><a href={`mailto:${settings.public_email}`}>{settings.public_email}</a><span>{settings.city ?? "Harare"}, Zimbabwe</span><a href="https://linkedin.com/company/infinity-aura-technologies" target="_blank" rel="noreferrer">LinkedIn</a></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Infinity Aura Technologies. All rights reserved.</span><span>{legalLinks.map((item, index) => <span key={item.href}>{index ? " · " : ""}<Link href={item.href}>{item.label}</Link></span>)}</span></div>
    </footer>
  );
}
