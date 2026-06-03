import { prisma } from "@/lib/db/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Fetch a content block from the database with 'use cache' enabled.
 * If the database query fails or is empty, falls back to the static content.
 */
export async function getContentBlock<T>(
  pageSlug: string,
  sectionSlug: string,
  fallback: T
): Promise<T> {
  "use cache";
  cacheLife("days");
  cacheTag(`content:${pageSlug}`);

  try {
    const block = await prisma.contentBlock.findFirst({
      where: { pageSlug, sectionSlug },
      orderBy: { version: "desc" },
    });

    if (block && block.data) {
      // Safely merge properties if it's an object to prevent partial content overwrites
      if (
        typeof fallback === "object" &&
        fallback !== null &&
        typeof block.data === "object" &&
        block.data !== null
      ) {
        return {
          ...fallback,
          ...(block.data as object),
        } as T;
      }
      return block.data as T;
    }
  } catch (error) {
    console.error(
      `[CMS] Failed to read content block for ${pageSlug}/${sectionSlug}, using static fallback:`,
      error
    );
  }

  return fallback;
}
