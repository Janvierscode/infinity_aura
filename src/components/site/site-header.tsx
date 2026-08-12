"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type HeaderItem = { id: string; label: string; url: string; open_in_new_tab: boolean };

export function SiteHeader({ navigation }: { navigation: HeaderItem[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container nav-shell">
        <Link className="brand" href="/" aria-label="Infinity Aura Technologies home" onClick={() => setOpen(false)}>
          <Image src="/brand/infinity-aura-icon.jpg" alt="" width={52} height={52} priority />
          <span><strong>Infinity Aura</strong><small>Technologies</small></span>
        </Link>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.id} href={item.url} target={item.open_in_new_tab ? "_blank" : undefined} rel={item.open_in_new_tab ? "noreferrer" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <Link className="button button-primary nav-cta" href="/contact" onClick={() => setOpen(false)}>
            Start a project <ArrowUpRight size={17} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
