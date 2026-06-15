import type { NextConfig } from "next";

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
    unoptimized: true,
  },
};

export default nextConfig;
