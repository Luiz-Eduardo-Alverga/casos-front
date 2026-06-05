import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import { getColaboradorLabelFromKanbanFiltros } from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";

export { PAINEL_KANBAN_FILTROS_STORAGE_KEY } from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";
export { getColaboradorLabelFromKanbanFiltros };

import type { Versao } from "@/services/auxiliar/versoes";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";

export function parseVersaoFieldValue(
  rawValue: string,
  versoes?: Versao[] | null,
): string {
  return resolveVersaoProdutoForApi(rawValue, versoes);
}

export function toSortableId(item: ProdutoOrdem): string {
  return String(item.id);
}
