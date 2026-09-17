"use client";

import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { PRODUTO_LABELS, PRODUTOS_PAGE_SIZE } from "@/components/produtos/constants";
import { ProdutosTabelaTable } from "@/components/produtos/tabela/produtos-tabela-table";
import {
  ProdutosListaMobileSkeleton,
  ProdutosTabelaSkeleton,
} from "@/components/produtos/tabela/produtos-tabela-skeleton";
import type { ProdutosFiltrosAplicados } from "@/components/produtos/filtros/produtos-filtros.types";
import { hasProdutosFiltros } from "@/hooks/produtos/use-produtos-filtros";
import { useProdutosInfinite } from "@/hooks/produtos/use-produtos";

interface ProdutosTabelaProps {
  filtros: ProdutosFiltrosAplicados;
  onClearFilters: () => void;
}

export function ProdutosTabela({
  filtros,
  onClearFilters,
}: ProdutosTabelaProps) {
  const hasFilters = hasProdutosFiltros(filtros);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProdutosInfinite(
    {
      NomeProjeto: filtros.nome || undefined,
      Setor: filtros.setor || undefined,
      per_page: PRODUTOS_PAGE_SIZE,
    },
    { enabled: hasFilters },
  );

  const itens = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">
            {PRODUTO_LABELS.listagem}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {!hasFilters ? (
          <EmptyState
            icon={Package}
            title={PRODUTO_LABELS.semFiltroTitulo}
            description={PRODUTO_LABELS.semFiltroDescricao}
          />
        ) : isLoading ? (
          <>
            <div className="hidden md:block">
              <ProdutosTabelaSkeleton />
            </div>
            <div className="md:hidden">
              <ProdutosListaMobileSkeleton />
            </div>
          </>
        ) : isError && itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={AlertTriangle}
              title={PRODUTO_LABELS.erroTitulo}
              description={PRODUTO_LABELS.erroDescricao}
            />
            <Button
              type="button"
              variant="outline"
              className="mb-8"
              onClick={() => void refetch()}
            >
              {PRODUTO_LABELS.tentarNovamente}
            </Button>
          </div>
        ) : itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={Package}
              title={PRODUTO_LABELS.vazioFiltroTitulo}
              description={PRODUTO_LABELS.vazioFiltroDescricao}
            />
            <Button
              type="button"
              variant="ghost"
              className="mb-8"
              onClick={onClearFilters}
            >
              {PRODUTO_LABELS.limparFiltros}
            </Button>
          </div>
        ) : (
          <>
            <ProdutosTabelaTable
              itens={itens}
              isFetchingNextPage={isFetchingNextPage}
            />
            {hasNextPage ? (
              <div ref={loadMoreRef} className="min-h-16" />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
