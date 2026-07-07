"use client";

import { Skeleton } from "@/components/ui/skeleton";

function InfoItemSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full max-w-[140px]" />
    </div>
  );
}

export function TicketItemCardSkeleton() {
  return (
    <article className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span className="absolute inset-y-0 left-0 w-1 bg-muted" aria-hidden />

      <div className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-7 w-32 rounded-md" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <Skeleton className="h-5 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 max-w-lg" />

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <InfoItemSkeleton key={index} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <InfoItemSkeleton key={`timeline-${index}`} />
          ))}
        </div>

        <div className="flex justify-end border-t border-border-divider pt-4">
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
      </div>
    </article>
  );
}
