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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProdutosOrdem } from "@/hooks/painel/produtos-ordem/use-produtos-ordem";
import { useCreateProdutosOrdem } from "@/hooks/painel/produtos-ordem/use-create-produtos-ordem";
import { useUpdateProdutosOrdem } from "@/hooks/painel/produtos-ordem/use-update-produtos-ordem";
import { useBulkUpdateProdutosOrdem } from "@/hooks/painel/produtos-ordem/use-bulk-update-produtos-ordem";
import { useDeleteProdutosOrdem } from "@/hooks/painel/produtos-ordem/use-delete-produtos-ordem";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import type { PainelKanbanProdutosModalProps } from "./types";
import { getVersoesQueryKey } from "@/components/casos/shared/versao-combobox";
import type { Versao } from "@/services/auxiliar/versoes";
import {
  getColaboradorLabelFromKanbanFiltros,
  parseVersaoFieldValue,
  toSortableId,
} from "./utils";
import { ProdutosModalAddForm } from "./produtos-modal-add-form";
import { ProdutosModalList } from "./produtos-modal-list";
import { PainelKanbanProdutosModalSkeleton } from "./produtos-modal-skeleton";
import { useQueryClient } from "@tanstack/react-query";

export function PainelKanbanProdutosModal({
  open,
  onOpenChange,
  idColaborador,
  nomeColaborador = "",
}: PainelKanbanProdutosModalProps) {
  const form = useForm<{ produto: string; versao: string }>({
    defaultValues: { produto: "", versao: "" },
  });
  const queryClient = useQueryClient();
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["agenda-dev", idColaborador] });
  }, [queryClient, idColaborador]);

  const colaboradorExibicao = useMemo(
    () =>
      open
        ? getColaboradorLabelFromKanbanFiltros(idColaborador, nomeColaborador)
        : nomeColaborador,
    [open, idColaborador, nomeColaborador],
  );

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
      const produtoId = String(values.produto ?? "").trim();
      const versoes = produtoId
        ? queryClient.getQueryData<Versao[]>(
          getVersoesQueryKey(produtoId, "", false),
        )
        : undefined;
      const versao = parseVersaoFieldValue(values.versao, versoes);
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
      await invalidate();
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
      const itemId = String(item.id);
      let removedItem: ProdutoOrdem | undefined;
      let removedAtIndex = -1;

      setItems((prev) => {
        const index = prev.findIndex((i) => String(i.id) === itemId);
        if (index < 0) return prev;
        removedItem = prev[index];
        removedAtIndex = index;
        return prev.filter((i) => String(i.id) !== itemId);
      });

      if (editingItemId === itemId) handleCancelEdit();

      try {
        await deleteMutation.mutateAsync({
          id: item.id,
          id_colaborador: Number(idColaborador),
        });
        toast.success("Produto removido do quadro.");
        await produtosOrdemQuery.refetch();
        await invalidate();
      } catch (error) {
        if (removedItem != null && removedAtIndex >= 0) {
          setItems((prev) => {
            if (prev.some((i) => String(i.id) === itemId)) return prev;
            const next = [...prev];
            next.splice(removedAtIndex, 0, removedItem!);
            return next;
          });
        } else {
          await produtosOrdemQuery.refetch();
        }
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
      invalidate,
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
        await invalidate();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao atualizar ordem.",
        );
        await produtosOrdemQuery.refetch();
      }
    },
    [bulkUpdateMutation, idColaborador, items, produtosOrdemQuery, invalidate],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full flex-col w-full sm:max-w-[588px] p-0 gap-0 border-border-divider [&>button]:hidden"
      >
        <SheetHeader className="shrink-0 border-b border-border-divider space-y-1.5 px-4 pb-4 pt-5 sm:px-6">
          <SheetTitle className="text-xl font-semibold text-text-primary leading-tight">
            Produtos do colaborador -{" "}
            <span className="font-bold">
              {colaboradorExibicao.trim() || "Não informado"}
            </span>
          </SheetTitle>
          <SheetDescription className="text-base text-text-secondary">
            Adicione os produtos e ordene da forma desejada
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
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

              <div className="min-h-0 flex-1">
                <ProdutosModalList
                  items={items}
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                  hasNextPage={Boolean(produtosOrdemQuery.hasNextPage)}
                  isFetchingNextPage={Boolean(
                    produtosOrdemQuery.isFetchingNextPage,
                  )}
                  fetchNextPage={() => void produtosOrdemQuery.fetchNextPage()}
                  editingItemId={editingItemId}
                  editVersao={editVersao}
                  versoesEdicao={versoesEdicao}
                  isSavingEdicao={updateMutation.isPending}
                  deletingItemId={
                    deleteMutation.isPending && deleteMutation.variables
                      ? String(deleteMutation.variables.id)
                      : null
                  }
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onChangeEditVersao={setEditVersao}
                  onConfirmEdit={handleConfirmEdit}
                  onDelete={handleDelete}
                />
              </div>
            </>
          )}
        </div>

        {/* <div className="shrink-0 border-t border-border-divider px-4 py-4 sm:px-6">
          <p className="flex items-center gap-1 text-sm font-medium text-text-primary">
            <Package className="h-4 w-4" />
            Quantidade: <span className="font-extrabold">{items.length}</span>
          </p>
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
