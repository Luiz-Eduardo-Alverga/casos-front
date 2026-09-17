"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, GitBranch, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { VersoesTabela } from "@/components/produtos/edicao/versoes/versoes-tabela";
import { VersoesTabelaSkeleton } from "@/components/produtos/edicao/versoes/versoes-skeleton";
import type { ProdutoVersaoData } from "@/services/produtos/types";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface VersoesListaProps {
  itens: ProdutoVersaoData[];
  canEdit: boolean;
  canDelete: boolean;
  usuarios?: Usuario[];
  currentUser?: User | null;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onNovaVersao: () => void;
  onEdit: (versao: ProdutoVersaoData) => void;
  onToggleStatus: (versao: ProdutoVersaoData) => void;
  onDelete: (versao: ProdutoVersaoData) => void;
}

export function VersoesLista({
  itens,
  canEdit,
  canDelete,
  usuarios,
  currentUser,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRetry,
  onNovaVersao,
  onEdit,
  onToggleStatus,
  onDelete,
}: VersoesListaProps) {
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
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.abaVersoes}
            </CardTitle>
          </div>
          {canEdit ? (
            <Button type="button" size="sm" onClick={onNovaVersao}>
              <Plus className="h-4 w-4" />
              {PRODUTO_LABELS.novaVersao}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <VersoesTabelaSkeleton />
        ) : isError && itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={AlertTriangle}
              title={PRODUTO_LABELS.erroTitulo}
              description={PRODUTO_LABELS.erroCarregarVersoes}
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
              icon={GitBranch}
              title={PRODUTO_LABELS.versoesVazioTitulo}
              description={PRODUTO_LABELS.versoesVazioDescricao}
            />
            {canEdit ? (
              <Button type="button" className="mb-8" onClick={onNovaVersao}>
                <Plus className="h-4 w-4" />
                {PRODUTO_LABELS.novaVersao}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <VersoesTabela
              itens={itens}
              canEdit={canEdit}
              canDelete={canDelete}
              usuarios={usuarios}
              currentUser={currentUser}
              isFetchingNextPage={isFetchingNextPage}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
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
