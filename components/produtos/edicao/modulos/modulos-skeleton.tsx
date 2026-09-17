"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ModulosListaSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando módulos">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 border-b border-border-divider px-4 py-4"
        >
          <Skeleton className="h-3 w-2/5 rounded-full" />
          <Skeleton className="h-2.5 w-3/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
