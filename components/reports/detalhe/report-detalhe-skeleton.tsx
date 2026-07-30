"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ReportDetalheSkeleton() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span className="absolute inset-x-0 top-0 h-1 bg-muted" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <Skeleton className="h-6 w-3/4" />

        <Skeleton className="h-10 w-full rounded-md" />

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border-divider pt-4">
          <Skeleton className="h-[42px] w-28 rounded-lg" />
          <Skeleton className="h-[42px] w-40 rounded-lg" />
          <Skeleton className="h-[42px] w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
