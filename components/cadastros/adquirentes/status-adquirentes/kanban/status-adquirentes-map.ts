"use client";

import type { AcquirerListExpandedItem } from "@/components/cadastros/types";
import {
  isAcquirerStatusKanbanColumn,
  type AcquirerStatusKanbanColumn,
} from "@/components/cadastros/adquirentes/adquirentes-shared";

export interface StatusAdquirentesKanbanItem {
  id: string;
  column: AcquirerStatusKanbanColumn;
  name: string;
  row: AcquirerListExpandedItem;
}

export function mapAdquirentesRowsToKanban(
  rows: AcquirerListExpandedItem[],
): StatusAdquirentesKanbanItem[] {
  const mapped: StatusAdquirentesKanbanItem[] = [];

  for (const row of rows) {
    if (!isAcquirerStatusKanbanColumn(row.status)) continue;
    if (!row.acquirerStatusId) continue;
    mapped.push({
      id: row.acquirerStatusId,
      column: row.status,
      name: row.acquirer.name,
      row,
    });
  }

  return mapped;
}
