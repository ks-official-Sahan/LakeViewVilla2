import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-teal-950/20 dark:bg-teal-900/10 border border-teal-900/10 dark:border-teal-800/10 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-teal-500/10 dark:before:via-teal-200/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
