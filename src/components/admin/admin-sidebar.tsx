import Image from "next/image";
import Link from "next/link";
import { Boxes, FileClock, FileText, Gauge, ImageIcon, Inbox, LayoutList, LogOut, MessageSquareQuote, PanelsTopLeft, ScrollText, Settings, Sparkles, Wrench } from "lucide-react";
import { logout } from "@/features/auth/actions";

const items = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/pages", label: "Pages", icon: PanelsTopLeft },
  { href: "/admin/services", label: "Services", icon: FileText },
  { href: "/admin/solutions", label: "Solutions", icon: Boxes },
  { href: "/admin/technologies", label: "Technologies", icon: Wrench },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/navigation", label: "Navigation", icon: LayoutList },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/revisions", label: "Revisions", icon: FileClock },
  { href: "/admin/activity", label: "Activity", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="admin-sidebar">
      <Link className="brand" href="/admin"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={48} height={48} /><span><strong>Infinity Aura</strong><small>Control Centre</small></span></Link>
      <nav aria-label="Admin navigation">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={18} />{label}</Link>)}</nav>
      <div className="admin-sidebar-footer"><div><Sparkles size={16} /><span><small>Signed in as</small><strong>{email}</strong></span></div><form action={logout}><button type="submit"><LogOut size={17} /> Sign out</button></form></div>
    </aside>
  );
}
