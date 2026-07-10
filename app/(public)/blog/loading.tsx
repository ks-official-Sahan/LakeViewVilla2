import { SuspenseFallback } from "@/components/motion/suspense-reveal";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <SuspenseFallback>
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Hero Area Skeleton */}
        <div className="flex flex-col items-center text-center mb-16">
          <Skeleton className="h-4 w-36 mb-4" />
          <Skeleton className="h-16 w-96 mb-6" />
          <Skeleton className="h-6 w-[500px]" />
        </div>

        {/* Search & Filter Skeleton */}
        <div className="space-y-4 mb-12">
          <Skeleton className="h-12 max-w-2xl mx-auto rounded-full" />
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Featured Post Card Skeleton */}
        <div className="mb-12 flex flex-col md:flex-row overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm min-h-[400px]">
          <div className="w-full md:w-[52%] aspect-[16/9] md:aspect-auto">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12 flex-1 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-[90%]" />
            <Skeleton className="h-6 w-[80%]" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm"
            >
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    </SuspenseFallback>
  );
}
