import Image from "next/image";
import Link from "next/link";
import { FileText, Gauge, ImageIcon, Inbox, Lightbulb, LogOut, Settings } from "lucide-react";
import { logout } from "@/features/auth/actions";

const items = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/admin/services", label: "Services", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) { return <aside className="admin-sidebar"><Link className="brand" href="/admin"><Image src="/brand/infinity-aura-icon.jpg" alt="" width={42} height={42} /><span><strong>Infinity Aura</strong><small>Admin</small></span></Link><nav aria-label="Admin navigation">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={18} />{label}</Link>)}</nav><div className="admin-sidebar-footer"><span>Signed in as<br /><strong>{email}</strong></span><form action={logout}><button type="submit"><LogOut size={17} /> Sign out</button></form></div></aside>; }
