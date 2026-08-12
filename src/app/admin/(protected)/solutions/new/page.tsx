import { ContentEditor } from "@/components/admin/content-editor";
import { saveSolution } from "@/features/content/actions";
export default function NewSolutionPage() { return <><header className="admin-page-header"><div><span>New content</span><h1>Create solution</h1><p>Show the problem, approach, and measurable benefits clearly.</p></div></header><ContentEditor kind="solution" action={saveSolution} /></>; }
