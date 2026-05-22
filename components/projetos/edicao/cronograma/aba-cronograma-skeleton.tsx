"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CardHeaderSkeleton() {
  return (
    <CardHeader className="border-b border-border-divider p-5 pb-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-40 shrink-0 rounded-md" />
      </div>
    </CardHeader>
  );
}

function TarefaCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-divider bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
      <Skeleton className="mt-3 h-5 w-3/4" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-4 flex justify-between border-t border-border-divider pt-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
}

export function AbaCronogramaSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card" role="status" aria-busy="true">
      <CardHeaderSkeleton />
      <CardContent className="p-6 pt-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TarefaCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
