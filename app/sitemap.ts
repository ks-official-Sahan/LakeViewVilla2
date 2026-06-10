import type { MetadataRoute } from "next";
import { getCachedBlogSitemapEntries } from "@/lib/blog/cached-queries";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "https://lakeviewvillatangalle.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/stays`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/gallery`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/visit`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/developer`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    blogPages = await getCachedBlogSitemapEntries();
  } catch {
    // DB unavailable — static URLs only
  }

  return [...staticPages, ...blogPages];
}
