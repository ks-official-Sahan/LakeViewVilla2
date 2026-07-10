import { after } from "next/server";
import { SITE_CONFIG } from "@/data/site";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

const SITE_ORIGIN = SITE_CONFIG.primaryDomain.replace(/\/$/, "");

/** Absolute public URL for a site path (leading slash). */
export function absoluteSiteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function blogPostUrl(slug: string): string {
  return absoluteSiteUrl(`/blog/${slug}`);
}

export function contentPageUrl(pageSlug: string): string {
  const routes: Record<string, string> = {
    home: "/",
    visit: "/visit",
    stays: "/stays",
    gallery: "/gallery",
    faq: "/faq",
  };
  return absoluteSiteUrl(routes[pageSlug] ?? `/${pageSlug}`);
}

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!INDEXNOW_KEY) {
    console.warn("[IndexNow] INDEXNOW_KEY not set — skipping ping");
    return;
  }

  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) return;

  const host = new URL(SITE_ORIGIN).hostname;

  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
    urlList: unique.slice(0, 10_000),
  });

  const results = await Promise.allSettled([
    fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.warn("[IndexNow] Ping failed:", r.reason);
    }
  }
}

/** Fire-and-forget IndexNow submission after publish/update (server actions / routes). */
export function notifyIndexNow(urls: string[]): void {
  if (!INDEXNOW_KEY || urls.length === 0) return;

  after(async () => {
    try {
      await pingIndexNow(urls);
      console.log("[IndexNow] Submitted", urls.length, "URL(s)");
    } catch (err) {
      console.warn("[IndexNow] notify failed:", err);
    }
  });
}
