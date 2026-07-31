"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RowSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CasosVersaoSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
