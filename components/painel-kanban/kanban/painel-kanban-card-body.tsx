"use client";

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportanciaBadge } from "@/components/importancia-badge";
import type { PainelKanbanItem } from "@/components/painel-kanban/kanban/painel-kanban-map";

interface PainelKanbanCardBodyProps {
  item: PainelKanbanItem;
}

export function PainelKanbanCardBody({ item }: PainelKanbanCardBodyProps) {
  const router = useRouter();

  return (
    <div
      className="flex flex-col gap-0"
      onClick={() => router.push(`/casos/${item.id}`)}
      role="presentation"
    >
      <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
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
      <div className="flex items-center justify-between mt-2 ">
        <span className="text-xs font-semibold text-text-secondary ">
          E: {item.tempoEstimado} / R: {item.tempoRealizado}
        </span>
        {/* {item.statusId !== "9" && (
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
        )} */}
      </div>
    </div>
  );
}
