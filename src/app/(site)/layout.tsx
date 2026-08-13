import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return <div className="site-shell"><a className="skip-link" href="#main-content">Skip to main content</a><SiteHeader /><main id="main-content">{children}</main><SiteFooter settings={settings} /></div>;
}
