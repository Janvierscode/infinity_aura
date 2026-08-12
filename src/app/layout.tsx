import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Infinity Aura Technologies | Innovate. Build. Empower.",
    template: "%s | Infinity Aura Technologies",
  },
  description:
    "Infinity Aura Technologies builds reliable software, web platforms, mobile applications, AI solutions, and digital systems for ambitious African organizations.",
  applicationName: "Infinity Aura Technologies",
  keywords: [
    "software development Zimbabwe",
    "web development Harare",
    "mobile applications",
    "AI solutions",
    "business automation",
  ],
  icons: { icon: "/brand/favicon.png" },
  openGraph: {
    type: "website",
    locale: "en_ZW",
    siteName: "Infinity Aura Technologies",
    title: "Infinity Aura Technologies | Innovate. Build. Empower.",
    description: "Building innovative digital solutions for tomorrow.",
    images: [{ url: "/brand/infinity-aura-logo.jpg", width: 1536, height: 1024 }],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080d17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
