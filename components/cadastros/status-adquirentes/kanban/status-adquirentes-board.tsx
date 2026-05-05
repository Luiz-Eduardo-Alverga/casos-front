"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  STATUS_ADQUIRENTES_COLUMNS,
  type StatusAdquirentesColumnMeta,
} from "./status-adquirentes-columns";
import type { StatusAdquirentesKanbanItem } from "./status-adquirentes-map";
import { StatusAdquirentesCardBody } from "./status-adquirentes-card-body";
import { StatusAdquirentesEmptyColumn } from "../layout/status-adquirentes-empty-column";
import {
  PainelContagemStatusBadge,
  PainelContagemStatusVariant,
} from "@/components/painel/painel-contagem-status-badge";

interface StatusAdquirentesBoardProps {
  data: StatusAdquirentesKanbanItem[];
  onDataChange: (data: StatusAdquirentesKanbanItem[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onCardClick?: (item: StatusAdquirentesKanbanItem) => void;
}

export function StatusAdquirentesBoard({
  data,
  onDataChange,
  onDragStart,
  onDragEnd,
  onCardClick,
}: StatusAdquirentesBoardProps) {
  return (
    <KanbanProvider<StatusAdquirentesKanbanItem, StatusAdquirentesColumnMeta>
      columns={STATUS_ADQUIRENTES_COLUMNS}
      data={data}
      onDataChange={onDataChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "grid min-h-0 w-full flex-1 grid-flow-col gap-4 pb-2",
        "overflow-x-auto overscroll-x-contain",
        // Mobile: 1 coluna por vez (scroll horizontal)
        "auto-cols-[calc(100%-0rem)] snap-x snap-mandatory",
        // Breakpoints: 2/3/4 colunas visíveis
        "sm:auto-cols-[calc((100%-1rem)/2)]",
        "lg:auto-cols-[calc((100%-2rem)/3)]",
        "xl:auto-cols-[calc((100%-4rem)/5)]",
      )}
    >
      {(column) => {
        const itemsInColumn = data.filter(
          (item) => item.column === column.id,
        ).length;

        return (
          <div
            key={column.id}
            className="flex min-h-0 w-full min-w-0 flex-col snap-start"
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
                    variant={column.id as PainelContagemStatusVariant}
                    className="shrink-0"
                  >
                    {itemsInColumn}
                  </PainelContagemStatusBadge>
                </div>
              </KanbanHeader>

              {itemsInColumn === 0 ? (
                <ScrollArea className="min-h-[200px] flex-1 overflow-hidden">
                  <SortableContext items={[]}>
                    <div className="flex flex-col gap-2 p-2">
                      <StatusAdquirentesEmptyColumn columnId={column.id} />
                    </div>
                  </SortableContext>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              ) : (
                <KanbanCards id={column.id} className="min-h-0 flex-1 p-3">
                  {(item: StatusAdquirentesKanbanItem) => (
                    <KanbanCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      column={item.column}
                      className="rounded-lg border border-border-divider bg-white shadow-sm"
                    >
                      <StatusAdquirentesCardBody
                        row={item.row}
                        onClick={() => onCardClick?.(item)}
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
  );
}
