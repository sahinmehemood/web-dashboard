import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder with shimmer wave animation.
 * Use `aria-busy="true"` on the parent container when showing skeletons.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-secondary/60", className)}
      aria-hidden="true"
      {...props}
    >
      <div className="shimmer absolute inset-0" />
    </div>
  );
}

/** Skeleton for a stat card. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mb-2 h-7 w-24" />
      <Skeleton className="mb-3 h-3 w-32" />
      <Skeleton className="mb-1 h-1 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

/** Skeleton for a table row. */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a page with header + content. */
export function PageSkeleton() {
  return (
    <div className="min-w-0 space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
