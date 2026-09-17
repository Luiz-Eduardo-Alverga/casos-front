"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, LayoutGrid, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ModuloRow } from "@/components/produtos/edicao/modulos/modulo-row";
import { ModulosListaSkeleton } from "@/components/produtos/edicao/modulos/modulos-skeleton";
import type { ProdutoModuloData } from "@/services/produtos/types";

export interface ModulosListProps {
  itens: ProdutoModuloData[];
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onNovoModulo: () => void;
  onEdit: (modulo: ProdutoModuloData) => void;
  onDelete: (modulo: ProdutoModuloData) => void;
}

export function ModulosList({
  itens,
  canEdit,
  canDelete,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRetry,
  onNovoModulo,
  onEdit,
  onDelete,
}: ModulosListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.abaModulos}
            </CardTitle>
          </div>
          {canEdit ? (
            <Button type="button" size="sm" onClick={onNovoModulo}>
              <Plus className="h-4 w-4" />
              {PRODUTO_LABELS.novoModulo}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <ModulosListaSkeleton />
        ) : isError && itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={AlertTriangle}
              title={PRODUTO_LABELS.erroTitulo}
              description={PRODUTO_LABELS.erroCarregarModulos}
            />
            <Button
              type="button"
              variant="outline"
              className="mb-8"
              onClick={onRetry}
            >
              {PRODUTO_LABELS.tentarNovamente}
            </Button>
          </div>
        ) : itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={LayoutGrid}
              title={PRODUTO_LABELS.modulosVazioTitulo}
              description={PRODUTO_LABELS.modulosVazioDescricao}
            />
            {canEdit ? (
              <Button type="button" className="mb-8" onClick={onNovoModulo}>
                <Plus className="h-4 w-4" />
                {PRODUTO_LABELS.novoModulo}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {itens.map((modulo) => (
              <ModuloRow
                key={modulo.Sequencia}
                modulo={modulo}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {isFetchingNextPage ? <ModulosListaSkeleton count={3} /> : null}
            {hasNextPage ? (
              <div ref={loadMoreRef} className="min-h-16" />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
