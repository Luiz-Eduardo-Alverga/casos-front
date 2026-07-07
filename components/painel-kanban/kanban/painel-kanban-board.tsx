"use client";

import { useCallback, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { PainelContagemStatusBadge } from "@/components/painel/painel-contagem-status-badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CasosProdutoSkeletonList } from "@/components/painel/casos-produto-skeleton";
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
import {
  compareKanbanByImportancia,
  type PainelKanbanItem,
} from "@/components/painel-kanban/kanban/painel-kanban-map";
import { EmptyColumnPlaceholder } from "../layout/empty-colums-placeholder";
import { PainelKanbanCardBody } from "@/components/painel-kanban/kanban/painel-kanban-card-body";
import { KanbanColumnLoadSentinel } from "@/components/painel-kanban/kanban/kanban-column-load-sentinel";
import {
  matchesKanbanColumnSearch,
  PainelKanbanColumnSearch,
} from "@/components/painel-kanban/kanban/painel-kanban-column-search";

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
  onExpand?: (item: PainelKanbanItem) => void;
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
  onExpand,
  columnBadgeCounts,
  columnLoad,
}: PainelKanbanBoardProps) {
  const columns = PAINEL_KANBAN_COLUMNS;
  const [columnSearch, setColumnSearch] = useState<
    Partial<Record<PainelKanbanColumnId, string>>
  >({});

  const setColumnSearchValue = useCallback(
    (columnId: PainelKanbanColumnId, value: string) => {
      setColumnSearch((prev) => ({ ...prev, [columnId]: value }));
    },
    [],
  );

  return (
    <KanbanProvider
      columns={columns}
      data={data}
      onDataChange={onDataChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "grid min-h-0 w-full flex-1 grid-flow-col gap-4",
        "overflow-x-auto overscroll-x-contain",
        // Mobile: 1 coluna por vez (scroll horizontal)
        "auto-cols-[calc(100%-0rem)] snap-x snap-mandatory",
        // Breakpoints: 2/3/4 colunas visíveis
        "sm:auto-cols-[calc((100%-1rem)/2)]",
        "lg:auto-cols-[calc((100%-2rem)/3)]",
        "xl:auto-cols-[calc((100%-3rem)/4)]",
      )}
    >
      {(column) => {
        const itemsInColumn = data.filter((d) => d.column === column.id).length;
        const badgeCount = columnBadgeCounts?.[column.id] ?? itemsInColumn;
        const load = columnLoad?.[column.id];
        const searchQuery = columnSearch[column.id] ?? "";

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
              <KanbanHeader className="m-0 flex shrink-0 items-center justify-between gap-2 overflow-visible border-b border-border-divider px-3 py-3">
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
                <PainelKanbanColumnSearch
                  value={searchQuery}
                  onChange={(value) => setColumnSearchValue(column.id, value)}
                  className="max-w-[140px] sm:max-w-[180px]"
                />
              </KanbanHeader>

              {load?.isLoading ? (
                <ScrollArea className="min-h-[200px] flex-1 overflow-hidden">
                  <SortableContext items={[]}>
                    <div className="flex flex-col gap-4 p-4">
                      <CasosProdutoSkeletonList count={3} />
                    </div>
                  </SortableContext>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              ) : itemsInColumn === 0 ? (
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
                  className="min-h-0 flex-1 p-3"
                  sortItems={compareKanbanByImportancia}
                  filterItems={(item) =>
                    matchesKanbanColumnSearch(
                      item.descricao,
                      item.name,
                      searchQuery,
                    )
                  }
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
                      dragHandle
                      onCardClick={() => onExpand?.(item)}
                      className={cn(
                        "border-0 bg-card !shadow-kanban-card cursor-pointer",
                        "transition-transform duration-200 hover:scale-[1.02]",
                        item.statusTempo === "INICIADO" &&
                          "border-l-4 border-l-primary",
                      )}
                    >
                      <PainelKanbanCardBody item={item} />
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
