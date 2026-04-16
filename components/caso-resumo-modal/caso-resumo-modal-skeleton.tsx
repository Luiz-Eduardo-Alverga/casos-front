"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CasoResumoModalSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-4 pt-8 bg-card">
      <div className="flex items-center justify-between px-6">
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-7 w-[90px] rounded-full" />
      </div>

      <div className="px-6 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[140px]" />
          <Skeleton className="h-[58px] w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-[160px]" />
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-[170px]" />
          <Skeleton className="h-[58px] w-full rounded-lg" />
        </div>
      </div>

      <div className="px-6">
        <Skeleton className="h-[140px] w-full rounded-lg" />
      </div>

      <div className="px-6 space-y-2">
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="px-6">
        <Skeleton className="h-[55px] w-full rounded-lg" />
      </div>

      <div className="px-6 flex gap-2.5">
        <Skeleton className="h-[42px] flex-1 rounded-lg" />
        <Skeleton className="h-[42px] flex-1 rounded-lg" />
      </div>
    </div>
  );
}

