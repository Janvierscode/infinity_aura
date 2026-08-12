import type { Metadata } from "next";
import { SolutionCard } from "@/components/site/solution-card";
import { getSolutions } from "@/lib/content";

export const metadata: Metadata = { title: "Digital Solutions", description: "Discover adaptable platforms for education, inventory, business operations, and AI-powered work." };

export default async function SolutionsPage() {
  const solutions = await getSolutions();
  return (
    <><section className="page-hero"><div className="container"><span className="eyebrow">Featured solutions</span><h1>Strong starting points. <span className="gradient-text">Tailored outcomes.</span></h1><p>Our solution frameworks accelerate delivery while leaving room for the workflows, controls, and experiences that make your organization distinct.</p></div></section><section className="section"><div className="container solutions-grid">{solutions.map((solution, index) => <SolutionCard key={solution.id} href={`/solutions/${solution.slug}`} category={solution.category} title={solution.title} summary={solution.summary} index={index} />)}</div></section></>
  );
}
