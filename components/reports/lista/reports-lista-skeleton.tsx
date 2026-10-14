"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 4;

function ReportListaRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-t border-border-divider px-4 py-4 pl-6 first:border-t-0">
      <Skeleton className="h-8 w-24 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="hidden h-8 w-32 shrink-0 xl:block" />
      <Skeleton className="hidden h-8 w-24 shrink-0 xl:block" />
      <Skeleton className="size-4 shrink-0 rounded-full" />
    </div>
  );
}

export function ReportsListaNextPageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      {Array.from({ length: count }).map((_, index) => (
        <ReportListaRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function ReportsListaSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <ReportsListaNextPageSkeleton count={ROWS} />
      </div>
    </div>
  );
}
