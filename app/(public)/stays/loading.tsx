import { Skeleton } from "@/components/ui/skeleton";

export default function StaysLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Title & Eyebrow */}
        <div className="mb-12">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stays List Skeleton */}
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col lg:flex-row overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm min-h-[450px]"
            >
              {/* Image side */}
              <div className="w-full lg:w-[60%] relative aspect-[16/10] lg:aspect-auto">
                <Skeleton className="h-full w-full" />
              </div>

              {/* Content side */}
              <div className="flex flex-col justify-between p-8 lg:p-12 flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-[80%]" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-[95%]" />
                </div>

                {/* Features / Details */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>

                {/* Call to action */}
                <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-12 w-36 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
