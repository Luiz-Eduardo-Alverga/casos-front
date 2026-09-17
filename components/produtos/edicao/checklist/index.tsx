"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ChecklistList } from "@/components/produtos/edicao/checklist/checklist-list";
import type { ChecklistItemFormData } from "@/components/produtos/edicao/checklist/checklist-schema";
import {
  buildCreateChecklistPayload,
  buildUpdateChecklistPayload,
  nextOrdenacao,
  sortChecklist,
} from "@/components/produtos/edicao/checklist/checklist-utils";
import { ProdutoConflitoDialog } from "@/components/produtos/edicao/produto-conflito-dialog";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import { useProdutoChecklist } from "@/hooks/produtos/use-produto-checklist";
import { useCreateProdutoChecklist } from "@/hooks/produtos/use-create-produto-checklist";
import { useUpdateProdutoChecklist } from "@/hooks/produtos/use-update-produto-checklist";
import { useDeleteProdutoChecklist } from "@/hooks/produtos/use-delete-produto-checklist";
import { getUser } from "@/lib/auth";
import { isApiError } from "@/services/produtos/api-error";
import type { ProdutoChecklistData } from "@/services/produtos/types";

export interface AbaChecklistProps {
  produtoId: number;
  enabled?: boolean;
}

export function AbaChecklist({ produtoId, enabled = true }: AbaChecklistProps) {
  const user = useMemo(() => getUser(), []);
  const { canEdit, canDelete } = useProdutoPermissoes();
  const { data: usuarios } = useRelatores({ enabled });
  const { data, isLoading, isError, refetch } = useProdutoChecklist(produtoId, {
    enabled,
  });
  const createItem = useCreateProdutoChecklist();
  const updateItem = useUpdateProdutoChecklist();
  const deleteItem = useDeleteProdutoChecklist();

  const itens = useMemo(() => sortChecklist(data ?? []), [data]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [excluirTarget, setExcluirTarget] =
    useState<ProdutoChecklistData | null>(null);
  const [conflitoAberto, setConflitoAberto] = useState(false);

  const editingItem = itens.find((item) => item.ID === editingId) ?? null;

  async function handleAdd(form: ChecklistItemFormData) {
    try {
      await createItem.mutateAsync({
        produtoId,
        data: buildCreateChecklistPayload(
          form.descricao,
          form.responsavelId,
          nextOrdenacao(itens),
        ),
      });
      toast.success(PRODUTO_LABELS.itemAdicionado);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroSalvarChecklist,
      );
      throw error;
    }
  }

  async function handleSaveEdit(form: ChecklistItemFormData) {
    if (!editingItem) return;
    try {
      await updateItem.mutateAsync({
        produtoId,
        itemId: editingItem.ID,
        data: buildUpdateChecklistPayload(
          form.descricao,
          form.responsavelId,
          editingItem,
        ),
      });
      toast.success(PRODUTO_LABELS.itemAtualizado);
      setEditingId(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroSalvarChecklist,
      );
    }
  }

  async function handleExcluir() {
    if (!excluirTarget) return;
    try {
      await deleteItem.mutateAsync({
        produtoId,
        itemId: excluirTarget.ID,
      });
      toast.success(PRODUTO_LABELS.itemExcluido);
      if (editingId === excluirTarget.ID) setEditingId(null);
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setConflitoAberto(true);
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroExcluirChecklist,
      );
    }
  }

  return (
    <>
      <ChecklistList
        itens={itens}
        canEdit={canEdit}
        canDelete={canDelete}
        usuarios={usuarios}
        currentUser={user}
        isLoading={isLoading}
        isError={isError}
        editingId={editingId}
        isSavingEdit={updateItem.isPending}
        isSavingAdd={createItem.isPending}
        onRetry={() => void refetch()}
        onEdit={(item) => setEditingId(item.ID)}
        onCancelEdit={() => setEditingId(null)}
        onSaveEdit={handleSaveEdit}
        onDelete={setExcluirTarget}
        onAdd={handleAdd}
      />

      <ConfirmacaoModal
        open={excluirTarget != null}
        onOpenChange={(open) => {
          if (!open) setExcluirTarget(null);
        }}
        titulo={PRODUTO_LABELS.excluirItemChecklistTitulo}
        descricao={excluirTarget?.DescricaoItem ?? ""}
        confirmarLabel={PRODUTO_LABELS.excluir}
        cancelarLabel={PRODUTO_LABELS.cancelar}
        variant="danger"
        isLoading={deleteItem.isPending}
        onConfirm={handleExcluir}
      />

      <ProdutoConflitoDialog
        open={conflitoAberto}
        onOpenChange={setConflitoAberto}
        titulo={PRODUTO_LABELS.conflitoChecklistTitulo}
        descricao={PRODUTO_LABELS.conflitoChecklistDescricao}
      />
    </>
  );
}
