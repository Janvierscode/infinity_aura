import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteChrome } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, navigation, socialLinks } = await getSiteChrome();
  const header = navigation.filter((item) => item.location === "header");
  const primary = navigation.filter((item) => item.location === "footer_primary");
  const services = navigation.filter((item) => item.location === "footer_services");
  const legal = navigation.filter((item) => item.location === "legal");
  const fallbackPrimary = header.filter((item) => item.url !== "/");
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="noise" aria-hidden="true" />
      <SiteHeader navigation={header} />
      <main id="main-content">{children}</main>
      <SiteFooter settings={settings} primaryLinks={primary.length ? primary : fallbackPrimary} serviceLinks={services.length ? services : []} legalLinks={legal} socialLinks={socialLinks} />
    </>
  );
}
