"use client";

import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PainelKanbanProdutosModalSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-divider bg-[#f8f9fa] p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[42px] w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[42px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[42px] min-w-[154px] rounded-lg" />
        </div>
      </div>

      <div className="border-t border-border-divider" />

      <div className="h-[360px] space-y-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-border-divider bg-white p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border-divider pt-4">
        <span className="flex items-center gaspan-1 text-sm font-medium text-text-primary">
          <Package className="h-4 w-4" />
          Quantidade: <Skeleton className="h-4 w-6" />
        </span>
      </div>
    </div>
  );
}
