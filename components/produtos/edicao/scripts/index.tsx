"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { PRODUTO_LABELS, PRODUTOS_PAGE_SIZE } from "@/components/produtos/constants";
import { ProdutoConflitoDialog } from "@/components/produtos/edicao/produto-conflito-dialog";
import { ScriptFormModal } from "@/components/produtos/edicao/scripts/script-form-modal";
import { sortScripts } from "@/components/produtos/edicao/scripts/script-form-utils";
import { ScriptsAccordion } from "@/components/produtos/edicao/scripts/scripts-accordion";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import { useProdutoScriptsInfinite } from "@/hooks/produtos/use-produto-scripts";
import { useDeleteProdutoScript } from "@/hooks/produtos/use-delete-produto-script";
import { isApiError } from "@/services/produtos/api-error";
import type { ProdutoScriptData } from "@/services/produtos/types";

export interface AbaScriptsProps {
  produtoId: number;
  enabled?: boolean;
}

export function AbaScripts({ produtoId, enabled = true }: AbaScriptsProps) {
  const { canEdit, canDelete } = useProdutoPermissoes();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProdutoScriptsInfinite(produtoId, {
    per_page: PRODUTOS_PAGE_SIZE,
    enabled,
  });

  const deleteScript = useDeleteProdutoScript();

  const itens = useMemo(
    () => sortScripts(data?.pages.flatMap((page) => page.data) ?? []),
    [data],
  );
  const handleLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProdutoScriptData | null>(null);
  const [excluirTarget, setExcluirTarget] = useState<ProdutoScriptData | null>(
    null,
  );
  const [conflitoAberto, setConflitoAberto] = useState(false);

  function handleNovoScript() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(script: ProdutoScriptData) {
    if (!canEdit) return;
    setEditing(script);
    setFormOpen(true);
  }

  async function handleExcluir() {
    if (!excluirTarget) return;
    try {
      await deleteScript.mutateAsync({
        produtoId,
        scriptId: excluirTarget.id,
      });
      toast.success(PRODUTO_LABELS.scriptExcluido);
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setConflitoAberto(true);
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroExcluirScript,
      );
    }
  }

  return (
    <>
      <ScriptsAccordion
        itens={itens}
        canEdit={canEdit}
        canDelete={canDelete}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        onLoadMore={handleLoadMore}
        onRetry={() => void refetch()}
        onNovoScript={handleNovoScript}
        onEdit={handleEdit}
        onDelete={setExcluirTarget}
      />

      <ScriptFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        produtoId={produtoId}
        script={editing}
      />

      <ConfirmacaoModal
        open={excluirTarget != null}
        onOpenChange={(open) => {
          if (!open) setExcluirTarget(null);
        }}
        titulo={PRODUTO_LABELS.excluirScriptTitulo}
        descricao={excluirTarget?.descricao ?? ""}
        aviso={PRODUTO_LABELS.excluirScriptAviso}
        confirmarLabel={PRODUTO_LABELS.excluir}
        cancelarLabel={PRODUTO_LABELS.cancelar}
        variant="danger"
        isLoading={deleteScript.isPending}
        onConfirm={handleExcluir}
      />

      <ProdutoConflitoDialog
        open={conflitoAberto}
        onOpenChange={setConflitoAberto}
        titulo={PRODUTO_LABELS.conflitoScriptTitulo}
        descricao={PRODUTO_LABELS.conflitoScriptDescricao}
      />
    </>
  );
}
