"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { PRODUTO_LABELS, PRODUTOS_PAGE_SIZE } from "@/components/produtos/constants";
import { ModuloConflitoDialog } from "@/components/produtos/edicao/modulos/modulo-conflito-dialog";
import { ModuloFormModal } from "@/components/produtos/edicao/modulos/modulo-form-modal";
import { sortModulos } from "@/components/produtos/edicao/modulos/modulo-form-utils";
import { ModulosList } from "@/components/produtos/edicao/modulos/modulos-list";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import { useProdutoModulosInfinite } from "@/hooks/produtos/use-produto-modulos";
import { useDeleteProdutoModulo } from "@/hooks/produtos/use-delete-produto-modulo";
import { isApiError } from "@/services/produtos/api-error";
import type { ProdutoModuloData } from "@/services/produtos/types";

export interface AbaModulosProps {
  produtoId: number;
  enabled?: boolean;
}

export function AbaModulos({ produtoId, enabled = true }: AbaModulosProps) {
  const { canEdit, canDelete } = useProdutoPermissoes();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProdutoModulosInfinite(produtoId, {
    per_page: PRODUTOS_PAGE_SIZE,
    enabled,
  });

  const deleteModulo = useDeleteProdutoModulo();

  const itens = useMemo(
    () => sortModulos(data?.pages.flatMap((page) => page.data) ?? []),
    [data],
  );
  const handleLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProdutoModuloData | null>(null);
  const [excluirTarget, setExcluirTarget] = useState<ProdutoModuloData | null>(
    null,
  );
  const [conflitoLabel, setConflitoLabel] = useState<string | null>(null);

  function handleNovoModulo() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(modulo: ProdutoModuloData) {
    if (!canEdit) return;
    setEditing(modulo);
    setFormOpen(true);
  }

  async function handleExcluir() {
    if (!excluirTarget) return;
    try {
      await deleteModulo.mutateAsync({
        produtoId,
        sequencia: excluirTarget.Sequencia,
      });
      toast.success(PRODUTO_LABELS.moduloExcluido);
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setConflitoLabel(excluirTarget.NomeModulo);
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroExcluirModulo,
      );
    }
  }

  return (
    <>
      <ModulosList
        itens={itens}
        canEdit={canEdit}
        canDelete={canDelete}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        onLoadMore={handleLoadMore}
        onRetry={() => void refetch()}
        onNovoModulo={handleNovoModulo}
        onEdit={handleEdit}
        onDelete={setExcluirTarget}
      />

      <ModuloFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        produtoId={produtoId}
        modulo={editing}
      />

      <ConfirmacaoModal
        open={excluirTarget != null}
        onOpenChange={(open) => {
          if (!open) setExcluirTarget(null);
        }}
        titulo={`${PRODUTO_LABELS.excluirModuloTitulo} ${excluirTarget?.NomeModulo ?? ""}?`}
        descricao={PRODUTO_LABELS.excluirModuloDescricao}
        confirmarLabel={PRODUTO_LABELS.excluir}
        cancelarLabel={PRODUTO_LABELS.cancelar}
        variant="danger"
        isLoading={deleteModulo.isPending}
        onConfirm={handleExcluir}
      />

      <ModuloConflitoDialog
        open={conflitoLabel != null}
        onOpenChange={(open) => {
          if (!open) setConflitoLabel(null);
        }}
        moduloLabel={conflitoLabel ?? undefined}
      />
    </>
  );
}
