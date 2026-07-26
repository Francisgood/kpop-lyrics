import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/define", destination: "/korean-slang", permanent: true },
      { source: "/define/:slug", destination: "/korean-slang/:slug", permanent: true },
    ];
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Optimizer ON: resize + AVIF/WebP, served same-origin via /_next/image.
    formats: ["image/avif", "image/webp"],
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    // Cache optimized variants for 31 days (they rarely change once published).
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // Long cache lifetimes for our static public assets (repeat-visit speed).
  async headers() {
    return [
      { source: "/avatars/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    ];
  },
};

export default nextConfig;
