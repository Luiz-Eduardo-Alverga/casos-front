"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProdutosOrdem } from "@/hooks/use-produtos-ordem";
import { useCreateProdutosOrdem } from "@/hooks/use-create-produtos-ordem";
import { useUpdateProdutosOrdem } from "@/hooks/use-update-produtos-ordem";
import { useBulkUpdateProdutosOrdem } from "@/hooks/use-bulk-update-produtos-ordem";
import { useDeleteProdutosOrdem } from "@/hooks/use-delete-produtos-ordem";
import { useVersoes } from "@/hooks/use-versoes";
import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import type { PainelKanbanProdutosModalProps } from "./types";
import { parseVersaoFieldValue, toSortableId } from "./utils";
import { ProdutosModalAddForm } from "./produtos-modal-add-form";
import { ProdutosModalList } from "./produtos-modal-list";
import { PainelKanbanProdutosModalSkeleton } from "./produtos-modal-skeleton";

export function PainelKanbanProdutosModal({
  open,
  onOpenChange,
  idColaborador,
}: PainelKanbanProdutosModalProps) {
  const form = useForm<{ produto: string; versao: string }>({
    defaultValues: { produto: "", versao: "" },
  });

  const createMutation = useCreateProdutosOrdem();
  const updateMutation = useUpdateProdutosOrdem();
  const bulkUpdateMutation = useBulkUpdateProdutosOrdem();
  const deleteMutation = useDeleteProdutosOrdem();

  const produtosOrdemQuery = useProdutosOrdem({
    id_colaborador: open ? idColaborador : "",
  });

  const [items, setItems] = useState<ProdutoOrdem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editVersao, setEditVersao] = useState("");
  const [editingProdutoId, setEditingProdutoId] = useState("");

  const { data: versoesEdicaoData } = useVersoes({
    produto_id: editingProdutoId,
    todas: false,
    enabled: Boolean(editingProdutoId) && open,
  });

  const versoesEdicao = useMemo(() => {
    const values = (versoesEdicaoData ?? [])
      .map((v) => v.versao?.trim())
      .filter((v): v is string => Boolean(v));
    if (editVersao && !values.includes(editVersao)) values.unshift(editVersao);
    return values;
  }, [versoesEdicaoData, editVersao]);

  useEffect(() => {
    if (!open) return;
    const all = produtosOrdemQuery.data?.pages.flatMap((p) => p.data) ?? [];
    const next = [...all].sort((a, b) => Number(a.ordem) - Number(b.ordem));
    setItems(next);
  }, [open, produtosOrdemQuery.data]);

  useEffect(() => {
    if (!open) {
      setEditingItemId(null);
      setEditVersao("");
      setEditingProdutoId("");
      form.reset({ produto: "", versao: "" });
    }
  }, [open, form]);

  const handleAdicionar = form.handleSubmit(async (values) => {
    try {
      const versao = parseVersaoFieldValue(values.versao);
      if (!values.produto?.trim() || !versao) {
        toast.error("Selecione produto e versão para adicionar.");
        return;
      }

      await createMutation.mutateAsync({
        id_colaborador: Number(idColaborador),
        id_produto: Number(values.produto),
        versao,
        ordem: items.length,
      });

      toast.success("Produto adicionado ao quadro.");
      form.reset({ produto: "", versao: "" });
      await produtosOrdemQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar produto.",
      );
    }
  });

  const handleStartEdit = useCallback((item: ProdutoOrdem) => {
    setEditingItemId(String(item.id));
    setEditingProdutoId(String(item.id_produto));
    setEditVersao(item.versao ?? "");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditVersao("");
    setEditingProdutoId("");
  }, []);

  const handleConfirmEdit = useCallback(
    async (item: ProdutoOrdem) => {
      try {
        if (!editVersao.trim()) {
          toast.error("Selecione uma versão válida.");
          return;
        }

        await updateMutation.mutateAsync({
          id: item.id,
          body: {
            id_colaborador: Number(idColaborador),
            id_produto: Number(item.id_produto),
            versao: editVersao.trim(),
            ordem: Number(item.ordem),
          },
        });

        toast.success("Versão atualizada com sucesso.");
        handleCancelEdit();
        await produtosOrdemQuery.refetch();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao atualizar versão.",
        );
      }
    },
    [
      editVersao,
      handleCancelEdit,
      idColaborador,
      produtosOrdemQuery,
      updateMutation,
    ],
  );

  const handleDelete = useCallback(
    async (item: ProdutoOrdem) => {
      try {
        await deleteMutation.mutateAsync({
          id: item.id,
          id_colaborador: Number(idColaborador),
        });
        toast.success("Produto removido do quadro.");
        if (editingItemId === String(item.id)) handleCancelEdit();
        await produtosOrdemQuery.refetch();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao remover produto.",
        );
      }
    },
    [
      deleteMutation,
      editingItemId,
      handleCancelEdit,
      idColaborador,
      produtosOrdemQuery,
    ],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex(
        (item) => toSortableId(item) === active.id,
      );
      const newIndex = items.findIndex(
        (item) => toSortableId(item) === over.id,
      );

      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          ordem: String(index),
        }),
      );
      setItems(reordered);

      try {
        await bulkUpdateMutation.mutateAsync({
          id_colaborador: Number(idColaborador),
          ids: reordered.map((item) => item.id),
          start_at: 0,
        });
        toast.success("Ordem atualizada com sucesso.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao atualizar ordem.",
        );
        await produtosOrdemQuery.refetch();
      }
    },
    [bulkUpdateMutation, idColaborador, items, produtosOrdemQuery],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,820px)] max-w-[820px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border-divider space-y-1.5">
          <DialogTitle className="text-xl font-semibold text-text-primary leading-tight">
            Produtos do Desenvolvedor
          </DialogTitle>
          <DialogDescription className="text-base text-text-secondary">
            Adicione os produtos e ordene da forma desejada
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {produtosOrdemQuery.isLoading ? (
            <PainelKanbanProdutosModalSkeleton />
          ) : (
            <>
              <ProdutosModalAddForm
                form={form}
                onSubmit={handleAdicionar}
                isSubmitting={createMutation.isPending}
              />

              <div className="border-t border-border-divider" />

              <ProdutosModalList
                items={items}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                hasNextPage={Boolean(produtosOrdemQuery.hasNextPage)}
                isFetchingNextPage={Boolean(produtosOrdemQuery.isFetchingNextPage)}
                fetchNextPage={() => void produtosOrdemQuery.fetchNextPage()}
                editingItemId={editingItemId}
                editVersao={editVersao}
                versoesEdicao={versoesEdicao}
                isSavingEdicao={updateMutation.isPending}
                isDeleting={deleteMutation.isPending}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onChangeEditVersao={setEditVersao}
                onConfirmEdit={handleConfirmEdit}
                onDelete={handleDelete}
              />

              <div className="border-t border-border-divider pt-4">
                <p className="flex items-center gap-1 text-sm font-medium text-text-primary">
                  <Package className="h-4 w-4" />
                  Quantidade:{" "}
                  <span className="font-extrabold">{items.length}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
