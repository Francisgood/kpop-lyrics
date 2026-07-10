import type { MetadataRoute } from "next";

const SITE = "https://www.aegyoarena.com";

// Crawling is open (including AI crawlers — see /llms.txt). Only private,
// auth, and thin/duplicate routes are excluded from the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/login",
          "/signup",
          "/forgot-password",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
