"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MinhaVisaoKpisSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-card shadow-card rounded-lg">
          <CardContent className="p-4 flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
