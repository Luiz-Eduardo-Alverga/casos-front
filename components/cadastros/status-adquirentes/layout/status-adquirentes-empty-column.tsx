"use client";

import type { AcquirerStatusKanbanColumn } from "@/components/cadastros/adquirentes/adquirentes-shared";
import { STATUS_ADQUIRENTES_COLUMNS } from "../kanban/status-adquirentes-columns";
import { EmptyState } from "@/components/painel/empty-state";
import { Ghost } from "lucide-react";

interface StatusAdquirentesEmptyColumnProps {
  columnId: AcquirerStatusKanbanColumn;
}

export function StatusAdquirentesEmptyColumn({
  columnId,
}: StatusAdquirentesEmptyColumnProps) {
  const columnMeta = STATUS_ADQUIRENTES_COLUMNS.find(
    (col) => col.id === columnId,
  );
  if (!columnMeta) return null;

  return (
    <EmptyState
      icon={Ghost}
      title={columnMeta.emptyTitle}
      description={columnMeta.emptyDescription}
      className="min-h-[160px] py-6"
    />
  );
}
