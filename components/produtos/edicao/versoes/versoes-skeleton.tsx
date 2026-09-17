"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function RowSkeleton({ delayClass = "" }: { delayClass?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 items-center gap-4 border-b border-border-divider px-4 py-4",
        delayClass,
      )}
    >
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-3 w-28 rounded-full" />
    </div>
  );
}

export function VersoesTabelaSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando versões">
      <div className="hidden md:block">
        {Array.from({ length: count }).map((_, index) => (
          <RowSkeleton key={index} />
        ))}
      </div>
      <div className="flex flex-col md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border-b border-border-divider px-4 py-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VersoesTabelaSkeletonRows({
  count = 3,
  columns = 8,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <tr key={index} className="border-t border-border-divider">
          {Array.from({ length: columns }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <Skeleton className="h-3 w-full max-w-24 rounded-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
