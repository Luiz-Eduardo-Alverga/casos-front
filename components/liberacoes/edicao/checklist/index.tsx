"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Download, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/painel/empty-state";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { ChecklistRow } from "@/components/liberacoes/edicao/checklist/checklist-row";
import { ChecklistSkeleton } from "@/components/liberacoes/edicao/checklist/checklist-skeleton";
import {
  filterChecklistRows,
  getChecklistProgress,
  mapLiberacaoChecklistItemToRow,
  type ChecklistFilter,
  type ChecklistRowState,
} from "@/components/liberacoes/edicao/checklist/utils";
import { useLiberacaoChecklist } from "@/hooks/liberacoes/use-liberacao-checklist";
import { useCarregarLiberacaoChecklist } from "@/hooks/liberacoes/use-carregar-liberacao-checklist";
import { useUpdateLiberacaoChecklistItem } from "@/hooks/liberacoes/use-update-liberacao-checklist-item";
import { useDeleteLiberacaoChecklistItem } from "@/hooks/liberacoes/use-delete-liberacao-checklist-item";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface AbaChecklistProps {
  registro: number | string;
  enabled?: boolean;
  disabled?: boolean;
}

const FILTER_OPTIONS: { value: ChecklistFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes" },
  { value: "concluidos", label: "Concluídos" },
];

export function AbaChecklist({
  registro,
  enabled = true,
  disabled = false,
}: AbaChecklistProps) {
  const { data, isLoading, isError, error } = useLiberacaoChecklist(registro, {
    enabled,
  });

  const carregarChecklist = useCarregarLiberacaoChecklist();
  const updateChecklistItem = useUpdateLiberacaoChecklistItem();
  const deleteChecklistItem = useDeleteLiberacaoChecklistItem();

  const [filter, setFilter] = useState<ChecklistFilter>("todos");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [itemParaExcluir, setItemParaExcluir] =
    useState<ChecklistRowState | null>(null);

  const rows = useMemo(
    () =>
      (data?.data ?? [])
        .slice()
        .sort((a, b) => a.ordenacao - b.ordenacao)
        .map(mapLiberacaoChecklistItemToRow),
    [data],
  );

  const progress = useMemo(() => getChecklistProgress(rows), [rows]);
  const filteredRows = useMemo(
    () => filterChecklistRows(rows, filter),
    [rows, filter],
  );

  const filterCounts: Record<ChecklistFilter, number> = {
    todos: progress.total,
    pendentes: progress.pendentes,
    concluidos: progress.concluidos,
  };

  const handleCarregar = async () => {
    try {
      const response = await carregarChecklist.mutateAsync({ registro });
      const { adicionados_count, ignorados_count } = response.data;

      if (adicionados_count > 0 && ignorados_count > 0) {
        toast.success(
          `${adicionados_count} item${adicionados_count > 1 ? "s" : ""} adicionado${adicionados_count > 1 ? "s" : ""}, ${ignorados_count} ignorado${ignorados_count > 1 ? "s" : ""}.`,
        );
      } else if (adicionados_count > 0) {
        toast.success(
          `${adicionados_count} item${adicionados_count > 1 ? "s" : ""} carregado${adicionados_count > 1 ? "s" : ""} com sucesso.`,
        );
      } else if (ignorados_count > 0) {
        toast.success(
          `Nenhum item novo. ${ignorados_count} já existente${ignorados_count > 1 ? "s" : ""}.`,
        );
      } else {
        toast.success("Checklist carregado.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao carregar checklist da liberação.",
      );
    }
  };

  const handleToggleChecado = async (
    row: ChecklistRowState,
    checado: boolean,
  ) => {
    setUpdatingId(row.id);
    try {
      await updateChecklistItem.mutateAsync({
        registro,
        itemId: row.id,
        data: {
          checado,
          observacao: row.observacao.trim() ? row.observacao : null,
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao atualizar item do checklist.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveObservacao = async (
    row: ChecklistRowState,
    observacao: string,
  ) => {
    setUpdatingId(row.id);
    try {
      await updateChecklistItem.mutateAsync({
        registro,
        itemId: row.id,
        data: {
          checado: row.checado,
          observacao: observacao.trim() ? observacao : null,
        },
      });
      toast.success("Observação salva com sucesso.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao salvar observação do checklist.",
      );
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExcluir = async () => {
    if (!itemParaExcluir) return;
    try {
      const response = await deleteChecklistItem.mutateAsync({
        registro,
        itemId: itemParaExcluir.id,
      });
      toast.success(
        response.message ?? "Item do checklist excluído com sucesso.",
      );
      setItemParaExcluir(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao excluir item do checklist.",
      );
    }
  };

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar checklist da liberação."}
      </p>
    );
  }

  if (isLoading) {
    return <ChecklistSkeleton rows={3} />;
  }

  if (rows.length === 0) {
    return (
      <Card className="rounded-lg bg-card shadow-card">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <EmptyState
            icon={ClipboardList}
            title="Nenhum item no checklist"
            description="Carregue os itens padrão do checklist para esta liberação."
          />
          <Button
            type="button"
            size="sm"
            disabled={disabled || carregarChecklist.isPending}
            onClick={() => void handleCarregar()}
          >
            {carregarChecklist.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Carregar checklist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Card className="rounded-lg bg-card shadow-card">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm text-text-primary">
            Progresso do Checklist:{" "}
            <span className="font-semibold tabular-nums">
              {progress.concluidos} de {progress.total} ({progress.percent}%)
            </span>
          </p>
          <Progress
            value={progress.percent}
            className="h-2 bg-emerald-600/15 [&>div]:bg-emerald-600"
            aria-label={`Progresso do checklist: ${progress.percent}%`}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as ChecklistFilter)}
        >
          <TabsList className="h-8 p-0.5">
            {FILTER_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="h-7 px-2.5 text-xs"
              >
                {option.label} ({filterCounts[option.value]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || carregarChecklist.isPending}
          onClick={() => void handleCarregar()}
        >
          {carregarChecklist.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Recarregar checklist
        </Button>
      </div>

      {filteredRows.length === 0 ? (
        <Card className="rounded-lg bg-card shadow-card">
          <CardContent className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="Nenhum item neste filtro"
              description="Altere o filtro para ver outros itens do checklist."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 pb-6">
          {filteredRows.map((row) => (
            <ChecklistRow
              key={row.id}
              item={row}
              disabled={disabled}
              isUpdating={updatingId === row.id}
              onToggleChecado={(checado) =>
                void handleToggleChecado(row, checado)
              }
              onSaveObservacao={(observacao) =>
                handleSaveObservacao(row, observacao)
              }
              onDelete={() => setItemParaExcluir(row)}
            />
          ))}
        </div>
      )}

      <ConfirmacaoModal
        open={itemParaExcluir != null}
        onOpenChange={(open) => !open && setItemParaExcluir(null)}
        titulo="Excluir item do checklist"
        descricao={`Tem certeza que deseja excluir o item "${itemParaExcluir?.descricaoItem}"?`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluir}
        variant="danger"
        isLoading={deleteChecklistItem.isPending}
      />
    </div>
  );
}
