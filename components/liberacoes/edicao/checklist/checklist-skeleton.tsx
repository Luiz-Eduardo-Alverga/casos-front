"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RowSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChecklistSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Card className="rounded-lg bg-card shadow-card">
        <CardContent className="space-y-2 p-4">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex gap-1">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
