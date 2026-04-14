"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { LayoutGrid, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { EmptyState } from "@/components/painel/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACQUIRER_STATUS_KANBAN_ORDER,
  useAdquirentesList,
  type AcquirerStatusKanbanColumn,
} from "@/components/cadastros/adquirentes/adquirentes-shared";
import { useUpdateAcquirerStatus } from "@/hooks/use-create-acquirer-status";
import { mapAdquirentesRowsToKanban } from "./kanban/status-adquirentes-map";
import { StatusAdquirentesBoard } from "./kanban/status-adquirentes-board";
import { StatusAdquirentesSkeleton } from "./layout/status-adquirentes-skeleton";
import { StatusAdquirentesSheet } from "./sheet/status-adquirentes-sheet";

interface StatusAdquirentesProps {
  initialSearch: string;
  initialStatus: string;
}

export function StatusAdquirentes({
  initialSearch,
  initialStatus,
}: StatusAdquirentesProps) {
  const queryClient = useQueryClient();
  const updateAcquirerStatusMutation = useUpdateAcquirerStatus();

  const { rows, showTableSkeleton, isError, error } = useAdquirentesList(
    initialSearch,
    initialStatus,
  );

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const mappedRows = useMemo(() => mapAdquirentesRowsToKanban(rows), [rows]);
  const [kanbanData, setKanbanData] = useState(mappedRows);
  const kanbanDataRef = useRef(kanbanData);
  const dragColumnStartRef = useRef<string>("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  useEffect(() => {
    setKanbanData(mappedRows);
  }, [mappedRows]);

  useEffect(() => {
    kanbanDataRef.current = kanbanData;
  }, [kanbanData]);

  const openCreateSheet = useCallback(() => {
    setSheetMode("create");
    setEditingStatusId(null);
    setSheetOpen(true);
  }, []);

  const openEditSheet = useCallback((statusId: string) => {
    setSheetMode("edit");
    setEditingStatusId(statusId);
    setSheetOpen(true);
  }, []);

  const isColumnId = useCallback(
    (id: string): id is AcquirerStatusKanbanColumn => {
      return (ACQUIRER_STATUS_KANBAN_ORDER as readonly string[]).includes(id);
    },
    [],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const row = kanbanDataRef.current.find((item) => item.id === activeId);
    dragColumnStartRef.current = row?.column ?? "";
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const fromColumn = dragColumnStartRef.current;
      const dataNow = kanbanDataRef.current;
      const overItem = dataNow.find((item) => item.id === overId);

      const targetColumn = overItem
        ? overItem.column
        : isColumnId(overId)
          ? overId
          : null;

      if (!targetColumn || !fromColumn || fromColumn === targetColumn) return;

      updateAcquirerStatusMutation.mutate(
        {
          id: activeId,
          input: {
            status: targetColumn,
          },
        },
        {
          onSuccess: async () => {
            toast.success("Status atualizado com sucesso.");
            await queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "Erro ao atualizar status.",
            );
            void queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
          },
        },
      );
    },
    [isColumnId, queryClient, updateAcquirerStatusMutation],
  );

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Status Adquirentes
          </h1>
          <p className="text-sm text-text-secondary">
            Visualize e gerencie os status de homologação das adquirentes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={openCreateSheet}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova homologação
          </Button>
        </div>
      </div>

      {showTableSkeleton ? (
        <StatusAdquirentesSkeleton />
      ) : kanbanData.length === 0 ? (
        <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
          <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Quadro Kanban de status
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <EmptyState
              icon={LayoutGrid}
              title="Nenhuma adquirente encontrada"
              description="Ajuste os filtros para visualizar os cards no quadro."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <StatusAdquirentesBoard
            data={kanbanData}
            onDataChange={setKanbanData}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onCardClick={(item) => openEditSheet(item.id)}
          />
        </div>
      )}

      <StatusAdquirentesSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        statusId={editingStatusId}
      />
    </div>
  );
}
