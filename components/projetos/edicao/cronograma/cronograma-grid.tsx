"use client";

import { useEffect, useRef } from "react";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import type { SgpTipoMeta } from "@/components/projetos/edicao/shared/sgp-tipos-utils";
import { CronogramaTarefaCard } from "@/components/projetos/edicao/cronograma/cronograma-tarefa-card";
import {
  resolveCronogramaTitulo,
  resolvePapelLabel,
} from "@/components/projetos/edicao/cronograma/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface CronogramaGridProps {
  tarefas: SgpCronogramaItem[];
  tiposMap: Map<number, string>;
  tiposMetaMap: Map<number, SgpTipoMeta>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onEditar: (tarefa: SgpCronogramaItem) => void;
  onExcluir: (tarefa: SgpCronogramaItem) => void;
  onConcluir: (tarefa: SgpCronogramaItem) => void;
}

function TarefaCardSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-lg" />;
}

export function CronogramaGrid({
  tarefas,
  tiposMap,
  tiposMetaMap,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onEditar,
  onExcluir,
  onConcluir,
}: CronogramaGridProps) {
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
        {tarefas.map((item) => (
          <CronogramaTarefaCard
            key={item.sequencia}
            item={item}
            titulo={resolveCronogramaTitulo(item.id_tipo, tiposMetaMap)}
            papelLabel={resolvePapelLabel(item.id_papel, tiposMap)}
            onEditar={onEditar}
            onExcluir={onExcluir}
            onConcluir={onConcluir}
          />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TarefaCardSkeleton key={i} />
          ))}
        </div>
      )}
      {hasNextPage && tarefas.length > 0 && (
        <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
      )}
    </div>
  );
}
