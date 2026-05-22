"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CardHeaderSkeleton({ titleWidth = "w-40" }: { titleWidth?: string }) {
  return (
    <CardHeader className="border-b border-border-divider p-5 pb-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <Skeleton className={cn("h-5", titleWidth)} />
        </div>
        <Skeleton className="h-10 w-44 shrink-0 rounded-md" />
      </div>
    </CardHeader>
  );
}

function RiscoCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-divider bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
      <Skeleton className="mt-3 h-5 w-full" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
    </div>
  );
}

function HistoricoRowSkeleton() {
  return (
    <div className="flex items-center gap-6 border-t border-border-divider px-5 py-3">
      <Skeleton className="h-5 w-[95px] shrink-0" />
      <Skeleton className="h-5 flex-1" />
      <Skeleton className="h-5 w-[200px] shrink-0" />
      <Skeleton className="h-8 w-[66px] shrink-0" />
    </div>
  );
}

export function AbaRiscoSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeaderSkeleton titleWidth="w-44" />
        <CardContent className="space-y-4 p-6 pt-3">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RiscoCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeaderSkeleton titleWidth="w-52" />
        <CardContent className="p-6 pt-3">
          <div className="overflow-hidden rounded-lg border border-border-divider">
            <div className="flex gap-6 border-b border-border-divider px-5 py-4">
              <Skeleton className="h-5 w-[95px]" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-5 w-[66px]" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <HistoricoRowSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
