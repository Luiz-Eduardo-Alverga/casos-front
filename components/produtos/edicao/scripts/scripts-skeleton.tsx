"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ScriptsListaSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando scripts">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border-divider px-4 py-4"
        >
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-3 flex-1 rounded-full" />
          <Skeleton className="h-3 w-4 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
