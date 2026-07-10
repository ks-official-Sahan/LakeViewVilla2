import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-teal-950/10 flex">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-teal-900/10 bg-teal-950/20 p-6 hidden md:flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Nav Links */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <Skeleton className="h-8 w-full" />
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-teal-900/10 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-sm" />
            <Skeleton className="h-10 w-32 rounded-sm" />
          </div>
        </div>

        {/* Dynamic Card Dashboard / Table Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border border-teal-900/10 bg-[var(--color-surface)] rounded-sm space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>

        {/* Large Table skeleton */}
        <div className="border border-teal-900/10 rounded-sm overflow-hidden bg-[var(--color-surface)]">
          <div className="p-4 border-b border-teal-900/10 flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="p-6 space-y-4">
            {/* Table Header */}
            <div className="flex justify-between border-b border-teal-900/10 pb-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/12" />
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between pt-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/12" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
