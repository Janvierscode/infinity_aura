"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { isThemePreference, resolveTheme, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const choices = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

const THEME_EVENT = "infinity-aura-theme-change";

function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getThemeSnapshot(): ThemePreference {
  const value = document.documentElement.dataset.themePreference;
  return isThemePreference(value) ? value : "system";
}

function applyTheme(preference: ThemePreference, systemPrefersDark: boolean) {
  const resolved = resolveTheme(preference, systemPrefersDark);
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", resolved === "dark" ? "#080d17" : "#ffffff");
}

export function ThemeSwitcher() {
  const preference = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "system");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const synchronizeSystemTheme = (systemPrefersDark = media.matches) => applyTheme("system", systemPrefersDark);
    const onSystemChange = (event: MediaQueryListEvent) => synchronizeSystemTheme(event.matches);
    const synchronizeCurrentSystemTheme = () => synchronizeSystemTheme();
    media.addEventListener("change", onSystemChange);
    window.addEventListener("focus", synchronizeCurrentSystemTheme);
    document.addEventListener("visibilitychange", synchronizeCurrentSystemTheme);
    const fallback = window.setInterval(() => synchronizeSystemTheme(), 1000);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("focus", synchronizeCurrentSystemTheme);
      document.removeEventListener("visibilitychange", synchronizeCurrentSystemTheme);
      window.clearInterval(fallback);
    };
  }, [preference]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const ActiveIcon = choices.find((choice) => choice.value === preference)?.icon ?? Monitor;

  function choose(nextPreference: ThemePreference) {
    localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    applyTheme(nextPreference, window.matchMedia("(prefers-color-scheme: dark)").matches);
    window.dispatchEvent(new Event(THEME_EVENT));
    setOpen(false);
  }

  return (
    <div className="theme-switcher" ref={containerRef}>
      <button className="theme-trigger" ref={triggerRef} type="button" aria-label={`Theme: ${preference}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <ActiveIcon size={18} aria-hidden="true" />
        <span className="theme-trigger-label">Theme</span>
      </button>
      {open && <div className="theme-menu" role="menu" aria-label="Choose website theme">{choices.map(({ value, label, icon: Icon }) => <button key={value} type="button" role="menuitemradio" aria-checked={preference === value} onClick={() => choose(value)}><Icon size={17} aria-hidden="true" /><span>{label}</span>{preference === value && <Check className="theme-check" size={16} aria-hidden="true" />}</button>)}</div>}
    </div>
  );
}
