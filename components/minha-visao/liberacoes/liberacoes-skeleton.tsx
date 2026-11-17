"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LiberacoesSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center gap-2 space-y-0">
        <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}
