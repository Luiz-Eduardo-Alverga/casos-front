"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { isApiError } from "@/services/produtos/api-error";
import { useProduto } from "@/hooks/produtos/use-produto";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ProdutoEditForm } from "@/components/produtos/edicao/produto-edit-form";
import { ProdutoEditSkeleton } from "@/components/produtos/edicao/produto-edit-skeleton";
import { ProdutoNaoEncontrado } from "@/components/produtos/edicao/produto-nao-encontrado";

export interface ProdutoEditViewProps {
  produtoId: string;
}

export function ProdutoEditView({ produtoId }: ProdutoEditViewProps) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProduto(produtoId);
  const produto = data?.data ?? null;

  if (isLoading) {
    return <ProdutoEditSkeleton />;
  }

  if (isError) {
    if (isApiError(error) && (error.status === 404 || error.status === 403)) {
      return <ProdutoNaoEncontrado produtoId={produtoId} />;
    }
    return (
      <div className="flex flex-1 flex-col px-6 pt-20">
        <EmptyState
          title={PRODUTO_LABELS.erroTitulo}
          description={
            error instanceof Error
              ? error.message
              : PRODUTO_LABELS.erroCarregarDetalhe
          }
        />
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RotateCcw className="h-4 w-4" />
            {PRODUTO_LABELS.tentarNovamente}
          </Button>
        </div>
      </div>
    );
  }

  if (!produto) {
    return <ProdutoNaoEncontrado produtoId={produtoId} />;
  }

  return <ProdutoEditForm produto={produto} />;
}
