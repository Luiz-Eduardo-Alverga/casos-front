"use client";

import { useEffect, useRef } from "react";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import { Skeleton } from "@/components/ui/skeleton";
import { RiscoCard } from "@/components/projetos/edicao/risco/risco-card";

export interface RiscosGridProps {
  riscos: SgpRiscoItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onEditar?: (item: SgpRiscoItem) => void;
  onExcluir?: (item: SgpRiscoItem) => void;
}

function RiscoCardSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-lg" />;
}

export function RiscosGrid({
  riscos,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onEditar,
  onExcluir,
}: RiscosGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {riscos.map((item) => (
          <RiscoCard
            key={item.sequencia}
            item={item}
            onEditar={onEditar}
            onExcluir={onExcluir}
          />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RiscoCardSkeleton key={i} />
          ))}
        </div>
      )}
      {hasNextPage && riscos.length > 0 && (
        <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
      )}
    </div>
  );
}
