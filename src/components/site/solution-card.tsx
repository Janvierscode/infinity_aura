import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type SolutionCardProps = {
  href: string;
  category: string | null;
  title: string;
  summary: string;
  index: number;
};

export function SolutionCard({ href, category, title, summary, index }: SolutionCardProps) {
  return (
    <article className="solution-card">
      <div className={`solution-visual visual-${(index % 4) + 1}`} aria-hidden="true">
        <span>0{index + 1}</span>
        <i /><i /><i />
      </div>
      <div className="solution-copy">
        <span>{category ?? "Digital solution"}</span>
        <h3>{title}</h3>
        <p>{summary}</p>
        <Link className="card-link" href={href}>View solution <ArrowUpRight size={16} /></Link>
      </div>
    </article>
  );
}
