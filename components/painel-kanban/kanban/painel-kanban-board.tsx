"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { PainelContagemStatusBadge } from "@/components/painel/painel-contagem-status-badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/kibo-ui/kanban";
import { cn } from "@/lib/utils";
import {
  PAINEL_KANBAN_COLUMNS,
  type PainelKanbanColumnId,
} from "@/components/painel-kanban/kanban/painel-kanban-columns";
import type { PainelKanbanItem } from "@/components/painel-kanban/kanban/painel-kanban-map";
import { EmptyColumnPlaceholder } from "../layout/empty-colums-placeholder";
import { PainelKanbanCardBody } from "@/components/painel-kanban/kanban/painel-kanban-card-body";
import { KanbanColumnLoadSentinel } from "@/components/painel-kanban/kanban/kanban-column-load-sentinel";
import { useState } from "react";
import { CasoResumoModal } from "@/components/caso-resumo-modal";

export interface PainelKanbanColumnLoadState {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
}

interface PainelKanbanBoardProps {
  data: PainelKanbanItem[];
  onDataChange: (data: PainelKanbanItem[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  /** Totais por coluna vindos da agenda (API); se ausente, o badge usa a contagem local dos itens carregados. */
  columnBadgeCounts?: Partial<Record<PainelKanbanColumnId, number>>;
  columnLoad?: Partial<
    Record<PainelKanbanColumnId, PainelKanbanColumnLoadState>
  >;
}

export function PainelKanbanBoard({
  data,
  onDataChange,
  onDragStart,
  onDragEnd,
  columnBadgeCounts,
  columnLoad,
}: PainelKanbanBoardProps) {
  const columns = PAINEL_KANBAN_COLUMNS;
  const [openResumo, setOpenResumo] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<PainelKanbanItem | null>(
    null,
  );

  return (
    <>
      <KanbanProvider
      columns={columns}
      data={data}
      onDataChange={onDataChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="grid min-h-0 w-full flex-1 auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-2"
    >
      {(column) => {
        const itemsInColumn = data.filter((d) => d.column === column.id).length;
        const badgeCount = columnBadgeCounts?.[column.id] ?? itemsInColumn;
        const load = columnLoad?.[column.id];
        return (
          <div
            key={column.id}
            className="flex min-h-0 min-w-[260px] flex-1 flex-col"
          >
            <KanbanBoard
              id={column.id}
              className={cn(
                "flex min-h-[320px] flex-1 flex-col divide-y-0 overflow-hidden rounded-lg border border-border-divider bg-card text-xs shadow-card ring-2 transition-all",
                "ring-transparent",
              )}
            >
              <KanbanHeader className="m-0 flex shrink-0 items-center justify-between gap-2 border-b border-border-divider px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      column.dotClass,
                    )}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-semibold text-text-primary">
                    {column.name}
                  </span>
                  <PainelContagemStatusBadge
                    variant={column.id}
                    className="shrink-0"
                  >
                    {badgeCount}
                  </PainelContagemStatusBadge>
                </div>
              </KanbanHeader>

              {itemsInColumn === 0 ? (
                <ScrollArea className="min-h-[200px] flex-1 overflow-hidden">
                  <SortableContext items={[]}>
                    <div className="flex flex-col gap-2 p-2">
                      <EmptyColumnPlaceholder columnId={column.id} />
                    </div>
                  </SortableContext>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              ) : (
                <KanbanCards
                  id={column.id}
                  className="max-h-[min(60vh,520px)] min-h-0 flex-1 p-4"
                  listFooter={
                    load?.hasNextPage && itemsInColumn > 0 ? (
                      <KanbanColumnLoadSentinel
                        hasNextPage={load.hasNextPage}
                        isFetchingNextPage={load.isFetchingNextPage}
                        fetchNextPage={load.fetchNextPage}
                      />
                    ) : null
                  }
                >
                  {(item: PainelKanbanItem) => (
                    <KanbanCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      column={item.column}
                      className={cn(
                        "rounded-lg border border-border-divider bg-white shadow-sm",
                        item.statusTempo === "INICIADO" &&
                          "border-l-4 border-l-primary",
                      )}
                    >
                      <PainelKanbanCardBody
                        item={item}
                        onExpand={(selected) => {
                          setItemSelecionado(selected);
                          setOpenResumo(true);
                        }}
                      />
                    </KanbanCard>
                  )}
                </KanbanCards>
              )}
            </KanbanBoard>
          </div>
        );
      }}
      </KanbanProvider>
      <CasoResumoModal
        open={openResumo}
        onOpenChange={setOpenResumo}
        variant="kanban"
        initialCaseId={itemSelecionado?.id}
      />
    </>
  );
}
