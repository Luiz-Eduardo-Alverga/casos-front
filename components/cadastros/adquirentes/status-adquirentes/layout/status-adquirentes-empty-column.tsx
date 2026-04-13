"use client";

import type { AcquirerStatusKanbanColumn } from "@/components/cadastros/adquirentes/adquirentes-shared";
import { STATUS_ADQUIRENTES_COLUMNS } from "../kanban/status-adquirentes-columns";

interface StatusAdquirentesEmptyColumnProps {
  columnId: AcquirerStatusKanbanColumn;
}

export function StatusAdquirentesEmptyColumn({
  columnId,
}: StatusAdquirentesEmptyColumnProps) {
  const columnMeta = STATUS_ADQUIRENTES_COLUMNS.find((col) => col.id === columnId);
  if (!columnMeta) return null;

  return (
    <div className="flex min-h-24 flex-col items-center justify-center rounded-md border border-dashed border-border-divider bg-muted/20 p-4 text-center">
      <p className="text-xs font-semibold text-text-primary">{columnMeta.emptyTitle}</p>
      <p className="mt-1 text-[11px] text-text-secondary">
        {columnMeta.emptyDescription}
      </p>
    </div>
  );
}
