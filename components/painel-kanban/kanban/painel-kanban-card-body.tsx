"use client";

import { useRouter } from "next/navigation";
import { GripVertical, Pencil } from "lucide-react";
import { ImportanciaBadge } from "@/components/badges/importancia-badge";
import { useKanbanDragHandle } from "@/components/kibo-ui/kanban";
import type { PainelKanbanItem } from "@/components/painel-kanban/kanban/painel-kanban-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PainelKanbanCardBodyProps {
  item: PainelKanbanItem;
}

export function PainelKanbanCardBody({ item }: PainelKanbanCardBodyProps) {
  const router = useRouter();
  const dragHandle = useKanbanDragHandle();

  return (
    <div className="flex gap-1">
      <div className="flex  min-w-0 flex-1 flex-col gap-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            {dragHandle && (
              <div
                {...dragHandle.listeners}
                {...dragHandle.attributes}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className={cn(
                  "flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground",
                  "touch-none transition-colors hover:bg-muted/50 active:cursor-grabbing",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
                aria-label="Arrastar card"
              >
                <GripVertical className="size-4" aria-hidden />
              </div>
            )}

            <div className="flex min-w-0 flex-1 items-start gap-3">
              <ImportanciaBadge
                importancia={item.importancia}
                className="shrink-0"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
              <span className="text-xs font-semibold text-text-primary">
                #{item.numero}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/casos/${item.id}`);
              }}
              aria-label="Editar caso"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="w-full max-w-full text-[10px] font-semibold leading-5 text-text-primary [overflow-wrap:anywhere] whitespace-normal">
          {item.descricao || item.name}
        </p>

        <div className="mt-2 flex items-center justify-between border-t border-border-divider pt-2">
          <span className="text-xs font-semibold text-text-secondary">
            E: {item.tempoEstimado} / R: {item.tempoRealizado}
          </span>
        </div>
      </div>
    </div>
  );
}
