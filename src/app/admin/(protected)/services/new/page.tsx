import { ContentEditor } from "@/components/admin/content-editor";
import { saveService } from "@/features/content/actions";
export default function NewServicePage() { return <><header className="admin-page-header"><div><span>New content</span><h1>Create service</h1><p>Build a clear public service page and save it as a draft first.</p></div></header><ContentEditor action={saveService} /></>; }
