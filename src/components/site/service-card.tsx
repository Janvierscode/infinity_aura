import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Cloud,
  Code2,
  Compass,
  GraduationCap,
  PanelsTopLeft,
  Smartphone,
  Workflow,
} from "lucide-react";

const icons = {
  "brain-circuit": BrainCircuit,
  cloud: Cloud,
  "code-2": Code2,
  compass: Compass,
  "graduation-cap": GraduationCap,
  "panels-top-left": PanelsTopLeft,
  smartphone: Smartphone,
  workflow: Workflow,
};

type ServiceCardProps = {
  href: string;
  iconKey: string | null;
  title: string;
  summary: string;
};

export function ServiceCard({ href, iconKey, title, summary }: ServiceCardProps) {
  const Icon = icons[(iconKey ?? "code-2") as keyof typeof icons] ?? Code2;

  return (
    <article className="content-card">
      <span className="icon-shell"><Icon size={23} strokeWidth={1.7} /></span>
      <h3>{title}</h3>
      <p>{summary}</p>
      <Link className="card-link" href={href}>Explore service <ArrowUpRight size={16} /></Link>
    </article>
  );
}
