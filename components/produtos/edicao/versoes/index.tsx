"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { PRODUTO_LABELS, PRODUTOS_PAGE_SIZE } from "@/components/produtos/constants";
import { VersaoConflitoDialog } from "@/components/produtos/edicao/versoes/versao-conflito-dialog";
import { VersaoFecharModal } from "@/components/produtos/edicao/versoes/versao-fechar-modal";
import { VersaoFormModal } from "@/components/produtos/edicao/versoes/versao-form-modal";
import { VersoesLista } from "@/components/produtos/edicao/versoes/versoes-lista";
import { buildToggleVersaoStatusPayload } from "@/components/produtos/edicao/versoes/versao-form-utils";
import { isVersaoAberta } from "@/components/produtos/edicao/versoes/utils";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import { useProdutoVersoesInfinite } from "@/hooks/produtos/use-produto-versoes";
import { useDeleteProdutoVersao } from "@/hooks/produtos/use-delete-produto-versao";
import { useUpdateProdutoVersao } from "@/hooks/produtos/use-update-produto-versao";
import { getUser } from "@/lib/auth";
import { isApiError } from "@/services/produtos/api-error";
import type { ProdutoVersaoData } from "@/services/produtos/types";

export interface AbaVersoesProps {
  produtoId: number;
  enabled?: boolean;
}

export function AbaVersoes({ produtoId, enabled = true }: AbaVersoesProps) {
  const user = useMemo(() => getUser(), []);
  const { canEdit, canDelete } = useProdutoPermissoes();
  const { data: usuarios } = useRelatores({ enabled });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProdutoVersoesInfinite(produtoId, {
    per_page: PRODUTOS_PAGE_SIZE,
    enabled,
  });

  const updateVersao = useUpdateProdutoVersao();
  const deleteVersao = useDeleteProdutoVersao();

  const itens = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const handleLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProdutoVersaoData | null>(null);
  const [fecharTarget, setFecharTarget] = useState<ProdutoVersaoData | null>(
    null,
  );
  const [reabrirTarget, setReabrirTarget] = useState<ProdutoVersaoData | null>(
    null,
  );
  const [excluirTarget, setExcluirTarget] = useState<ProdutoVersaoData | null>(
    null,
  );
  const [conflitoLabel, setConflitoLabel] = useState<string | null>(null);

  function handleNovaVersao() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(versao: ProdutoVersaoData) {
    if (!canEdit) return;
    setEditing(versao);
    setFormOpen(true);
  }

  function handleToggleStatus(versao: ProdutoVersaoData) {
    if (isVersaoAberta(versao.Status)) {
      setFecharTarget(versao);
      return;
    }
    setReabrirTarget(versao);
  }

  async function handleFechar(fechamento: string) {
    if (!fecharTarget) return;
    try {
      await updateVersao.mutateAsync({
        produtoId,
        sequencia: fecharTarget.Sequencia,
        data: buildToggleVersaoStatusPayload(fecharTarget, {
          status: "FECHADO",
          fechamento,
        }),
      });
      toast.success(PRODUTO_LABELS.versaoFechada);
      setFecharTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroSalvarVersao,
      );
    }
  }

  async function handleReabrir() {
    if (!reabrirTarget) return;
    try {
      await updateVersao.mutateAsync({
        produtoId,
        sequencia: reabrirTarget.Sequencia,
        data: buildToggleVersaoStatusPayload(reabrirTarget, {
          status: "ABERTO",
        }),
      });
      toast.success(PRODUTO_LABELS.versaoReaberta);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroSalvarVersao,
      );
    }
  }

  async function handleExcluir() {
    if (!excluirTarget) return;
    try {
      await deleteVersao.mutateAsync({
        produtoId,
        sequencia: excluirTarget.Sequencia,
      });
      toast.success(PRODUTO_LABELS.versaoExcluida);
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setConflitoLabel(excluirTarget.Versao);
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroExcluirVersao,
      );
    }
  }

  return (
    <>
      <VersoesLista
        itens={itens}
        canEdit={canEdit}
        canDelete={canDelete}
        usuarios={usuarios}
        currentUser={user}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        onLoadMore={handleLoadMore}
        onRetry={() => void refetch()}
        onNovaVersao={handleNovaVersao}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={setExcluirTarget}
      />

      <VersaoFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        produtoId={produtoId}
        versao={editing}
      />

      <VersaoFecharModal
        open={fecharTarget != null}
        onOpenChange={(open) => {
          if (!open) setFecharTarget(null);
        }}
        versao={fecharTarget}
        isSaving={updateVersao.isPending}
        onConfirm={handleFechar}
      />

      <ConfirmacaoModal
        open={reabrirTarget != null}
        onOpenChange={(open) => {
          if (!open) setReabrirTarget(null);
        }}
        titulo={`${PRODUTO_LABELS.reabrirVersao} ${reabrirTarget?.Versao ?? ""}?`}
        descricao={PRODUTO_LABELS.reabrirVersaoDescricao}
        confirmarLabel={PRODUTO_LABELS.reabrir}
        cancelarLabel={PRODUTO_LABELS.cancelar}
        isLoading={updateVersao.isPending}
        onConfirm={handleReabrir}
      />

      <ConfirmacaoModal
        open={excluirTarget != null}
        onOpenChange={(open) => {
          if (!open) setExcluirTarget(null);
        }}
        titulo={`${PRODUTO_LABELS.excluirVersaoTitulo} ${excluirTarget?.Versao ?? ""}?`}
        descricao={`${PRODUTO_LABELS.excluirVersaoDescricao} ${PRODUTO_LABELS.excluirVersaoAviso}`}
        confirmarLabel={PRODUTO_LABELS.excluir}
        cancelarLabel={PRODUTO_LABELS.cancelar}
        variant="danger"
        isLoading={deleteVersao.isPending}
        onConfirm={handleExcluir}
      />

      <VersaoConflitoDialog
        open={conflitoLabel != null}
        onOpenChange={(open) => {
          if (!open) setConflitoLabel(null);
        }}
        versaoLabel={conflitoLabel ?? undefined}
      />
    </>
  );
}
