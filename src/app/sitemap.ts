import type { MetadataRoute } from "next";
import { getBusinessIdeas, getServices } from "@/lib/content";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, ideas] = await Promise.all([getServices(), getBusinessIdeas()]);
  const pages = ["", "/about", "/services", "/ideas", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" || path === "/ideas" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  return pages.concat(
    services.map(({ slug }) => ({ url: `${siteUrl}/services/${slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    ideas.map(({ slug, updated_at }) => ({ url: `${siteUrl}/ideas/${slug}`, lastModified: updated_at, changeFrequency: "weekly" as const, priority: 0.8 })),
  );
}
