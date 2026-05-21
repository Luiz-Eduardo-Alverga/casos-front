"use client";

import { useEffect, useRef } from "react";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { Skeleton } from "@/components/ui/skeleton";
import { StakeCard } from "@/components/projetos/edicao/stakes/stake-card";
import { resolveStakeTipoLabel } from "@/components/projetos/edicao/stakes/utils";

export interface StakesGridProps {
  stakes: SgpStakeItem[];
  tiposMap: Map<number, string>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onEditar?: (stake: SgpStakeItem) => void;
  onExcluir?: (stake: SgpStakeItem) => void;
}

export function StakesGrid({
  stakes,
  tiposMap,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onEditar,
  onExcluir,
}: StakesGridProps) {
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stakes.map((stake) => (
          <StakeCard
            key={stake.sequencia}
            stake={stake}
            tipoLabel={resolveStakeTipoLabel(stake.id_tipo, tiposMap)}
            onEditar={onEditar}
            onExcluir={onExcluir}
          />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[230px] rounded-lg" />
          ))}
        </div>
      )}
      {hasNextPage && stakes.length > 0 && (
        <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
      )}
    </div>
  );
}
