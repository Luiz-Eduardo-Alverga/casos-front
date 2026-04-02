import { EmptyState } from "@/components/painel/empty-state";
import { Ghost } from "lucide-react";
import {
  PAINEL_KANBAN_COLUMNS,
  PainelKanbanColumnId,
} from "../kanban/painel-kanban-columns";

export function EmptyColumnPlaceholder({
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
