import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import { getColaboradorLabelFromKanbanFiltros } from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";

export { PAINEL_KANBAN_FILTROS_STORAGE_KEY } from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";
export { getColaboradorLabelFromKanbanFiltros };

export function parseVersaoFieldValue(rawValue: string): string {
  if (!rawValue) return "";
  return rawValue.split("-")[1]?.trim() || rawValue;
}

export function toSortableId(item: ProdutoOrdem): string {
  return String(item.id);
}
