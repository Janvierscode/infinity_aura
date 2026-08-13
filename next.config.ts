import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/ideas", permanent: true },
      { source: "/blog/:slug", destination: "/ideas/:slug", permanent: true },
      { source: "/admin/articles", destination: "/admin/ideas", permanent: true },
      { source: "/admin/articles/:path*", destination: "/admin/ideas/:path*", permanent: true },
      { source: "/solutions", destination: "/services", permanent: true },
      { source: "/solutions/:path*", destination: "/services", permanent: true },
    ];
  },
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      { protocol: "http", hostname: "127.0.0.1", port: "54321" },
      { protocol: "http", hostname: "localhost", port: "54321" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
