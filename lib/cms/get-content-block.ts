import { prisma } from "@/lib/db/prisma";
import { cacheLife, cacheTag } from "next/cache";

async function fetchDbBlock(pageSlug: string, sectionSlug: string): Promise<any> {
  "use cache";
  cacheLife("days");
  cacheTag(`content:${pageSlug}`);

  const block = await prisma.contentBlock.findFirst({
    where: { pageSlug, sectionSlug },
    orderBy: { version: "desc" },
  });
  return block ? block.data : null;
}

/**
 * Fetch a content block from the database with 'use cache' enabled.
 * If the database query fails or is empty, falls back to the static content.
 */
export async function getContentBlock<T>(
  pageSlug: string,
  sectionSlug: string,
  fallback: T
): Promise<T> {
  try {
    const data = await fetchDbBlock(pageSlug, sectionSlug);

    if (data) {
      // Safely merge properties if it's an object to prevent partial content overwrites
      if (
        typeof fallback === "object" &&
        fallback !== null &&
        typeof data === "object" &&
        data !== null
      ) {
        return {
          ...fallback,
          ...(data as object),
        } as T;
      }
      return data as T;
    }
  } catch (error) {
    console.error(
      `[CMS] Failed to read content block for ${pageSlug}/${sectionSlug}, using static fallback:`,
      error
    );
  }

  return fallback;
}
