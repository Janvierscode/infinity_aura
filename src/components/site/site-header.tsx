"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/ideas", label: "Business Ideas" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { document.body.classList.toggle("menu-open", open); return () => document.body.classList.remove("menu-open"); }, [open]);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => setSignedIn(Boolean(data?.claims?.sub)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" href="/" aria-label="Infinity Aura Technologies home" onClick={() => setOpen(false)}>
          <Image src="/brand/infinity-aura-icon.jpg" alt="" width={42} height={42} priority />
          <span><strong>Infinity Aura</strong><small>Technologies</small></span>
        </Link>
        <button className="menu-button" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        <nav id="site-navigation" className={open ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} prefetch onClick={() => setOpen(false)}>{item.label}</Link>)}
          <ThemeSwitcher />
          <span className="member-nav-slot">{signedIn === null ? <span className="member-nav-placeholder" aria-hidden="true" /> : signedIn ? <Link className="member-nav-button" href="/account" onClick={() => setOpen(false)}>Account</Link> : <Link className="member-nav-button" href="/account/login" onClick={() => setOpen(false)}>Sign in</Link>}</span>
          <Link className="button button-primary nav-cta" href="/ideas" onClick={() => setOpen(false)}>Explore ideas</Link>
        </nav>
      </div>
    </header>
  );
}
