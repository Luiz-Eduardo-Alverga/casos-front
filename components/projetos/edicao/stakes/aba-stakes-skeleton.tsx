"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CardHeaderSkeleton({ titleWidth = "w-32" }: { titleWidth?: string }) {
  return (
    <CardHeader className="border-b border-border-divider p-5 pb-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <Skeleton className={cn("h-4", titleWidth)} />
        </div>
        <Skeleton className="h-10 w-48 shrink-0 rounded-md" />
      </div>
    </CardHeader>
  );
}

function StakeCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-divider bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function UsuarioCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border-divider bg-background p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded" />
    </div>
  );
}

export function AbaStakesSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-busy="true">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeaderSkeleton titleWidth="w-36" />
        <CardContent className="space-y-4 p-6 pt-3">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StakeCardSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeaderSkeleton titleWidth="w-44" />
        <CardContent className="p-6 pt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <UsuarioCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
