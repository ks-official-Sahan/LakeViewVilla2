import { SuspenseFallback } from "@/components/motion/suspense-reveal";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <SuspenseFallback>
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Gallery Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-12 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Masonry / Grid Skeleton */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            // vary height to simulate masonry
            const heights = ["h-64", "h-96", "h-[350px]", "h-80", "h-[450px]"];
            const height = heights[i % heights.length];
            return (
              <div
                key={i}
                className={`break-inside-avoid overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm ${height}`}
              >
                <Skeleton className="h-full w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </main>
    </SuspenseFallback>
  );
}
