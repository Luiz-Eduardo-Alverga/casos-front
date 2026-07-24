"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CasosEmProducaoSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-2 space-y-0 flex-wrap">
        <div className="space-y-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-64 rounded-lg shrink-0" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-52" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
