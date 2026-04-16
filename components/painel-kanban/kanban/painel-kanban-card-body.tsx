"use client";

import { useRouter } from "next/navigation";
import { Expand, Pencil } from "lucide-react";
import { ImportanciaBadge } from "@/components/importancia-badge";
import type { PainelKanbanItem } from "@/components/painel-kanban/kanban/painel-kanban-map";
import { Button } from "@/components/ui/button";

interface PainelKanbanCardBodyProps {
  item: PainelKanbanItem;
  onExpand: (item: PainelKanbanItem) => void;
}

export function PainelKanbanCardBody({ item, onExpand }: PainelKanbanCardBodyProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-divider">
        <div className="flex gap-3 items-start min-w-0 flex-1">
        <ImportanciaBadge importancia={item.importancia} className="shrink-0" />
        <div className="flex-1 flex flex-wrap gap-2 items-start min-w-0">
          <span className="text-xs font-semibold text-text-primary">
            #{item.numero}
          </span>
          <p className="text-[10px] font-semibold text-text-secondary leading-5 w-full">
            {item.descricao || item.name}
          </p>
        </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onExpand(item)}
            aria-label="Expandir caso"
          >
            <Expand className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => router.push(`/casos/${item.id}`)}
            aria-label="Editar caso"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ">
        <span className="text-xs font-semibold text-text-secondary ">
          E: {item.tempoEstimado} / R: {item.tempoRealizado}
        </span>
      </div>
    </div>
  );
}
