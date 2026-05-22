"use client";

import { useEffect, useRef } from "react";
import type { SgpRiscoHistoricoItem } from "@/interfaces/sgp-risco-historico";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { RiscoHistoricoRow } from "@/components/projetos/edicao/risco/risco-historico-row";

export interface RiscoHistoricoTableProps {
  itens: SgpRiscoHistoricoItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onEditar?: (item: SgpRiscoHistoricoItem) => void;
  onExcluir?: (item: SgpRiscoHistoricoItem) => void;
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

export function RiscoHistoricoTable({
  itens,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onEditar,
  onExcluir,
}: RiscoHistoricoTableProps) {
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
    <div className="overflow-hidden rounded-lg border border-border-divider bg-background">
      <div className="flex items-end gap-6 border-b border-border-divider px-5 py-4">
        <p className="w-[95px] shrink-0 text-sm font-medium text-text-primary">
          Data
        </p>
        <p className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          Descrição
        </p>
        <p className="w-full max-w-[355px] shrink-0 text-sm font-medium text-text-primary">
          Impacto Gerado
        </p>
        <p className="w-[66px] shrink-0 text-right text-sm font-medium text-text-primary">
          Ações
        </p>
      </div>

      <ScrollArea className="h-[360px]">
        <div>
          {itens.map((item) => (
            <RiscoHistoricoRow
              key={item.id}
              item={item}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 2 }).map((_, i) => (
              <HistoricoRowSkeleton key={i} />
            ))}
          {hasNextPage && itens.length > 0 && (
            <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
