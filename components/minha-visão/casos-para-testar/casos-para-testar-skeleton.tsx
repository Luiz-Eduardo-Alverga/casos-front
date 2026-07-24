"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CasosParaTestarSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-56 rounded-lg shrink-0" />
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
