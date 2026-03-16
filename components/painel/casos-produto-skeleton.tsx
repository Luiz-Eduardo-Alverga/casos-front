"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "lucide-react";

const CASES = 5;

const SKELETON_ITEM = (
  <div className="bg-white border border-border-divider rounded-lg p-3.5 flex flex-col gap-0">
    <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
      <Skeleton className="h-7 w-9 shrink-0 rounded-full" />
      <div className="flex-1 flex flex-wrap gap-3.75 items-start space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-full max-w-[280px]" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2.5">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

/** Lista de itens skeleton para uso no CardContent (ex.: loading inicial ou paginação infinita). */
export function CasosProdutoSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{SKELETON_ITEM}</div>
      ))}
    </div>
  );
}

export function CasosProdutoSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1 lg:h-full lg:overflow-hidden">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Box className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            <Skeleton className="h-4 w-[220px]" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <CasosProdutoSkeletonList count={CASES} />
      </CardContent>
    </Card>
  );
}
