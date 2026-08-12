import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  settings: { company_name: string; tagline: string; public_email: string; city: string | null };
  primaryLinks: Array<{ id: string; label: string; url: string; open_in_new_tab: boolean }>;
  serviceLinks: Array<{ id: string; label: string; url: string; open_in_new_tab: boolean }>;
  legalLinks: Array<{ id: string; label: string; url: string; open_in_new_tab: boolean }>;
  socialLinks: Array<{ id: string; label: string; url: string; icon_key: string }>;
};

export function SiteFooter({ settings, primaryLinks, serviceLinks, legalLinks, socialLinks }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <Image src="/brand/infinity-aura-icon.jpg" alt="" width={52} height={52} />
            <span><strong>Infinity Aura</strong><small>Technologies</small></span>
          </Link>
          <p>{settings.tagline}</p>
          <span>Digital systems designed for progress in Africa.</span>
        </div>
        <div className="footer-column">
          <strong>Company</strong>
          {primaryLinks.map((item) => <Link key={item.id} href={item.url} target={item.open_in_new_tab ? "_blank" : undefined}>{item.label}</Link>)}
        </div>
        <div className="footer-column">
          <strong>Services</strong>
          {serviceLinks.map((item) => <Link key={item.id} href={item.url} target={item.open_in_new_tab ? "_blank" : undefined}>{item.label}</Link>)}
        </div>
        <div className="footer-column">
          <strong>Connect</strong>
          <a href={`mailto:${settings.public_email}`}>{settings.public_email}</a>
          <span>{settings.city ?? "Harare"}, Zimbabwe</span>
          <div className="social-row">
            {socialLinks.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}><span aria-hidden="true">{item.icon_key === "linkedin" ? "in" : item.icon_key === "facebook" ? "f" : "</>"}</span></a>)}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Infinity Aura Technologies. All rights reserved.</span>
        <span>{legalLinks.map((item, index) => <span key={item.id}>{index > 0 ? " · " : ""}<Link href={item.url}>{item.label}</Link></span>)}</span>
      </div>
    </footer>
  );
}
