import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";

export const PAINEL_KANBAN_FILTROS_STORAGE_KEY = "PAINEL_KANBAN_FILTROS";

/** Nome do colaborador do filtro "Ver como" persistido no painel kanban. */
export function getColaboradorLabelFromKanbanFiltros(
  idColaborador: string,
  fallback: string,
): string {
  if (typeof window === "undefined") return fallback;

  const colaboradorId = idColaborador.trim();
  if (!colaboradorId) return fallback;

  try {
    const raw = localStorage.getItem(PAINEL_KANBAN_FILTROS_STORAGE_KEY);
    if (!raw) return fallback;

    const saved = JSON.parse(raw) as Partial<PainelKanbanFiltrosForm>;
    const savedId = saved.devAtribuido?.trim();
    const savedLabel = saved.devAtribuidoLabel?.trim();

    if (savedId === colaboradorId && savedLabel) {
      return savedLabel;
    }
  } catch {
    // Ignora valores inválidos no localStorage.
  }

  return fallback;
}

export function parseVersaoFieldValue(rawValue: string): string {
  if (!rawValue) return "";
  return rawValue.split("-")[1]?.trim() || rawValue;
}

export function toSortableId(item: ProdutoOrdem): string {
  return String(item.id);
}

