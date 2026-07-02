"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CARDS = 4;

function ReportCardSkeleton() {
  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span className="absolute inset-y-0 left-0 w-1 bg-muted" aria-hidden />
      <div className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>

        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-border-divider pt-4">
          <Skeleton className="h-[42px] w-28 rounded-lg" />
          <Skeleton className="h-[42px] w-40 rounded-lg" />
          <Skeleton className="ml-auto h-[42px] w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ReportsListaSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: CARDS }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}
