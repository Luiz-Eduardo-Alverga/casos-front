"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { Ghost, Loader2, MoreHorizontal, Play } from "lucide-react";
import { SortableContext } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { PainelContagemStatusBadge } from "@/components/painel/painel-contagem-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/painel/empty-state";
import { ImportanciaBadge } from "@/components/importancia-badge";
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
} from "@/components/painel/painel-kanban-columns";
import type { PainelKanbanItem } from "@/components/painel/painel-kanban-map";

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
  columnLoad?: Partial<
    Record<PainelKanbanColumnId, PainelKanbanColumnLoadState>
  >;
}

function PainelKanbanCardBody({ item }: { item: PainelKanbanItem }) {
  const router = useRouter();
  const urgente =
    item.tipoCategoria.toLowerCase().includes("urgente") ||
    item.importancia >= 8;

  return (
    <div
      className="flex flex-col gap-0"
      onClick={() => router.push(`/casos/${item.id}`)}
      role="presentation"
    >
      <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
        <ImportanciaBadge
          importancia={item.importancia}
          className="shrink-0"
        />
        <div className="flex-1 flex flex-wrap gap-2 items-start min-w-0">
          <span className="text-xs font-semibold text-text-primary">
            #{item.numero}
          </span>
          <p className="text-[10px] font-semibold text-text-secondary leading-5 w-full">
            {item.descricao || item.name}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-2.5">
        {item.modulo ? (
          <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[10px]">
            {item.modulo}
          </Badge>
        ) : null}
        {urgente ? (
          <Badge
            variant="destructive"
            className="rounded-full px-3 py-0.5 text-[10px]"
          >
            URGENTE
          </Badge>
        ) : null}
        <span className="text-xs font-semibold text-text-secondary ml-auto">
          E: {item.tempoEstimado} / R: {item.tempoRealizado}
        </span>
      </div>
      <div className="flex justify-end mt-2">
        <Button
          type="button"
          size="sm"
          className="h-8 bg-green-600 text-white hover:bg-green-700"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      </div>
    </div>
  );
}

function EmptyColumnPlaceholder({
  columnId,
}: {
  columnId: PainelKanbanColumnId;
}) {
  const meta = PAINEL_KANBAN_COLUMNS.find((c) => c.id === columnId);
  if (!meta) return null;
  return (
    <EmptyState
      icon={columnId === "retornos" ? Ghost : undefined}
      title={meta.emptyTitle}
      description={meta.emptyDescription}
      className="min-h-[160px] py-6"
    />
  );
}

export function PainelKanbanBoard({
  data,
  onDataChange,
  onDragStart,
  onDragEnd,
  columnLoad,
}: PainelKanbanBoardProps) {
  const columns = PAINEL_KANBAN_COLUMNS;

  return (
    <KanbanProvider
      columns={columns}
      data={data}
      onDataChange={onDataChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="grid min-h-0 w-full flex-1 auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-2"
    >
      {(column) => {
        const count = data.filter((d) => d.column === column.id).length;
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
                    className={cn("size-2 shrink-0 rounded-full", column.dotClass)}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-semibold text-text-primary">
                    {column.name}
                  </span>
                  <PainelContagemStatusBadge
                    variant={column.id}
                    className="shrink-0"
                  >
                    {count}
                  </PainelContagemStatusBadge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label="Opções da coluna"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      Em breve
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </KanbanHeader>

              {count === 0 ? (
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
                  className="max-h-[min(60vh,520px)] min-h-0 flex-1"
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
                      <PainelKanbanCardBody item={item} />
                    </KanbanCard>
                  )}
                </KanbanCards>
              )}

              {load?.hasNextPage ? (
                <div className="shrink-0 border-t border-border-divider p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={load.isFetchingNextPage}
                    onClick={() => load.fetchNextPage()}
                  >
                    {load.isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      "Carregar mais"
                    )}
                  </Button>
                </div>
              ) : null}
            </KanbanBoard>
          </div>
        );
      }}
    </KanbanProvider>
  );
}
