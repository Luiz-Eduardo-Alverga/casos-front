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
      className="grid min-h-0 w-full flex-1 auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-2"
    >
      {(column) => {
        const itemsInColumn = data.filter(
          (item) => item.column === column.id,
        ).length;

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
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0 text-xs font-semibold border-0",
                      column.badgeClass,
                    )}
                  >
                    {itemsInColumn}
                  </Badge>
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
