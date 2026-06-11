import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 md:px-8 space-y-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64 mb-6" />
        <div className="p-6 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-sm space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </main>
  );
}
