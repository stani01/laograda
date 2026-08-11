import type { MetadataRoute } from "next";

// Keeps the admin panel and API routes out of search engine indexes.
// Not a security boundary on its own (auth already guards /admin, see
// src/app/admin/(protected)/layout.tsx) — just avoids these URLs showing up
// in search results / being crawled unnecessarily.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
  };
}
