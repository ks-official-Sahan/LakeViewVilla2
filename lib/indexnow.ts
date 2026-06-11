import { SITE_CONFIG } from "@/data/site";

// lib/indexnow.ts
const INDEXNOW_KEY = process.env.INDEXNOW_KEY!;

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!INDEXNOW_KEY) {
    console.warn("[IndexNow] INDEXNOW_KEY not set — skipping ping");
    return;
  }

  const host = new URL(SITE_CONFIG.primaryDomain).hostname;

  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_CONFIG.primaryDomain.replace(/\/$/, "")}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  // Ping both — Bing processes faster for .ae, IndexNow.org syndicates to others
  await Promise.allSettled([
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
}
