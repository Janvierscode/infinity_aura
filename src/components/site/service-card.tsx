import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ServiceCard({ href, title, summary }: { href: string; iconKey: string | null; title: string; summary: string }) {
  return <article className="service-card"><h3>{title}</h3><p>{summary}</p><Link className="text-link" href={href}>Learn more <ArrowUpRight size={16} /></Link></article>;
}
