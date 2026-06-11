import { Skeleton } from "@/components/ui/skeleton";

export default function DeveloperLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
        {/* Split Grid Profile section */}
        <div className="grid lg:grid-cols-[420px,1fr] gap-8 items-stretch">
          {/* Portrait card skeleton */}
          <div className="p-8 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm flex flex-col items-center">
            <Skeleton className="h-32 w-32 rounded-full mb-6" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64 mb-6" />
            <div className="grid grid-cols-2 gap-2 w-full mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2 w-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          {/* Right details card skeleton */}
          <div className="p-8 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-[95%]" />
              <Skeleton className="h-6 w-[80%]" />
            </div>

            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-36 rounded-sm" />
              ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border border-[var(--color-border)] rounded-sm space-y-2">
                  <Skeleton className="h-4 w-16 mx-auto" />
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flagship Work Section title */}
        <div className="text-center space-y-2 pt-6">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-5 w-72 mx-auto" />
        </div>

        {/* Grid repositories */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-28 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
