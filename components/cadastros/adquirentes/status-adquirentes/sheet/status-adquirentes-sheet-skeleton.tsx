"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StatusAdquirentesSheetSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="border-t border-border-divider" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="border-t border-border-divider" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="rounded-lg border border-border-divider bg-muted/30 p-2 space-y-2">
          <Skeleton className="h-4 w-44" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-3 w-64" />
        </div>

        <div className="border-t border-border-divider" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        <div className="rounded-lg border border-border-divider p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border-divider bg-background px-6 py-4 space-y-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

