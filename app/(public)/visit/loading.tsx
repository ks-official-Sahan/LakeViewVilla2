import { SuspenseFallback } from "@/components/motion/suspense-reveal";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitLoading() {
  return (
    <SuspenseFallback>
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-full mx-auto" />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Form Side */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>

          {/* Details / Info Side */}
          <div className="space-y-8">
            <Skeleton className="h-8 w-56 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-[var(--color-border)] rounded-sm bg-[var(--color-surface)]">
                  <Skeleton className="h-10 w-10 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Micro-map / Visual widget placeholder */}
            <div className="border border-[var(--color-border)] rounded-sm overflow-hidden h-[300px]">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
    </SuspenseFallback>
  );
}
