import type { MetadataRoute } from "next";
import { getServices, getSolutions } from "@/lib/content";
import { siteUrl } from "@/lib/env";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, solutions] = await Promise.all([getServices(), getSolutions()]);
  return ["", "/about", "/services", "/solutions", "/contact", "/privacy", "/terms"].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : .7 })).concat(services.map(({ slug }) => ({ url: `${siteUrl}/services/${slug}`, changeFrequency: "monthly" as const, priority: .75 })), solutions.map(({ slug }) => ({ url: `${siteUrl}/solutions/${slug}`, changeFrequency: "monthly" as const, priority: .75 })));
}
