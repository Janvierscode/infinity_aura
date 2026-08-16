import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/env";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const geist = localFont({ src: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", variable: "--font-geist", display: "swap", weight: "100 900" });
const geistMono = localFont({ src: "../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2", variable: "--font-geist-mono", display: "swap", weight: "100 900" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Infinity Aura Technologies | Innovate. Build. Empower.",
    template: "%s | Infinity Aura Technologies",
  },
  description:
    "Discover practical business ideas, evaluate what they take to launch, and learn from community insight on Infinity Aura Technologies.",
  applicationName: "Infinity Aura Technologies",
  keywords: [
    "software development Zimbabwe",
    "web development Harare",
    "mobile applications",
    "AI solutions",
    "business automation",
    "business ideas Africa",
    "small business opportunities Zimbabwe",
  ],
  icons: { icon: "/brand/favicon.png" },
  openGraph: {
    type: "website",
    locale: "en_ZW",
    siteName: "Infinity Aura Technologies",
    title: "Infinity Aura Technologies | Innovate. Build. Empower.",
    description: "Practical business ideas, community insight, and technology for people ready to build.",
    images: [{ url: "/brand/infinity-aura-logo.jpg", width: 1536, height: 1024 }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)},p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var a=location.pathname.startsWith("/admin"),d=!a&&(p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)),t=d?"dark":"light",r=document.documentElement;r.dataset.themePreference=p;r.dataset.theme=t;r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?"#080d17":"#ffffff"}catch(e){}})()`;
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} data-theme="light" data-theme-preference="system" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script id="theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
