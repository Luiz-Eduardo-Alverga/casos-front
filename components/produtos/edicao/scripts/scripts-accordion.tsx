"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, FileCode, Plus } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ScriptItem } from "@/components/produtos/edicao/scripts/script-item";
import { isFirstUnorderedScript } from "@/components/produtos/edicao/scripts/script-form-utils";
import { ScriptsListaSkeleton } from "@/components/produtos/edicao/scripts/scripts-skeleton";
import type { ProdutoScriptData } from "@/services/produtos/types";

export interface ScriptsAccordionProps {
  itens: ProdutoScriptData[];
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onNovoScript: () => void;
  onEdit: (script: ProdutoScriptData) => void;
  onDelete: (script: ProdutoScriptData) => void;
}

export function ScriptsAccordion({
  itens,
  canEdit,
  canDelete,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRetry,
  onNovoScript,
  onEdit,
  onDelete,
}: ScriptsAccordionProps) {
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

  const defaultOpen = itens[0] ? String(itens[0].id) : undefined;

  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.abaScripts}
            </CardTitle>
          </div>
          {canEdit ? (
            <Button type="button" size="sm" onClick={onNovoScript}>
              <Plus className="h-4 w-4" />
              {PRODUTO_LABELS.novoScript}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <ScriptsListaSkeleton />
        ) : isError && itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={AlertTriangle}
              title={PRODUTO_LABELS.erroTitulo}
              description={PRODUTO_LABELS.erroCarregarScripts}
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
              icon={FileCode}
              title={PRODUTO_LABELS.scriptsVazioTitulo}
              description={PRODUTO_LABELS.scriptsVazioDescricao}
            />
            {canEdit ? (
              <Button type="button" className="mb-8" onClick={onNovoScript}>
                <Plus className="h-4 w-4" />
                {PRODUTO_LABELS.novoScript}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen}
              className="w-full"
            >
              {itens.map((script, index) => (
                <ScriptItem
                  key={script.id}
                  script={script}
                  showSemOrdemDivider={isFirstUnorderedScript(itens, index)}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </Accordion>
            {isFetchingNextPage ? <ScriptsListaSkeleton count={3} /> : null}
            {hasNextPage ? (
              <div ref={loadMoreRef} className="min-h-16" />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
