"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircleHelp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { CasosTabelaSkeleton } from "@/components/casos/layout/casos-tabela-skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import { ProjetoMemoriaSortChip } from "@/components/projetos/tabela/projeto-memoria-sort-chip";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";
import { mapProjetoMemoriaToTabelaRow } from "@/components/projetos/tabela/map-projeto-memoria-to-escopo-row";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";

interface ClienteCasosTabProps {
  clienteId: number;
}

export function ClienteCasosTab({ clienteId }: ClienteCasosTabProps) {
  const [sort, setSort] = useState<ProjetoMemoriaSortState>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const memoriaParams = useMemo(
    () => ({
      cliente: clienteId,
      ...sort,
    }),
    [clienteId, sort],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useProjetoMemoria(memoriaParams);

  const itens = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.data.map(mapProjetoMemoriaToTabelaRow),
      ) ?? [],
    [data],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, itens.length]);

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Casos"
        icon={Box}
        iconClassName="text-sky-600"
        trailing={
          <div className="flex items-center gap-2">
            <ProjetoMemoriaSortChip
              sort={sort}
              onClear={() => setSort({})}
            />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Como ordenar a listagem"
                  >
                    <CircleHelp className="h-4 w-4" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs text-xs leading-snug"
                >
                  <p className="font-semibold">Ordenação da listagem</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4">
                    <li>
                      Pelo cabeçalho da tabela, usando o ícone de setas nas
                      colunas ordenáveis.
                    </li>
                    <li>
                      Clicando com o botão direito nos campos da linha (ID,
                      produto, importância, estimativas e status).
                    </li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
      />

      <CardContent className="space-y-4 p-6 pt-4">
        {isLoading ? (
          <CasosTabelaSkeleton />
        ) : isError ? (
          <p className="py-12 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os casos vinculados."}
          </p>
        ) : itens.length === 0 ? (
          <EmptyState
            icon={Box}
            title="Nenhum caso vinculado"
            description="Este cliente ainda não possui casos vinculados."
            className="min-h-[240px]"
          />
        ) : (
          <>
            <ProjetosTabelaTable
              variant="escopo"
              itens={itens}
              isFetchingNextPage={isFetchingNextPage}
              sort={sort}
              onSortChange={setSort}
            />
            {hasNextPage && itens.length > 0 ? (
              <div ref={loadMoreRef} className="min-h-[48px]" aria-hidden />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
