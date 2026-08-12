import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { hasSupabaseEnv } from "@/lib/env";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) redirect("/admin/login");
  const { email } = await requireAdmin();

  return <div className="admin-shell"><AdminSidebar email={email} /><main className="admin-main">{children}</main></div>;
}
