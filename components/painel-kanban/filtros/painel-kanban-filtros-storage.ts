import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";

export const PAINEL_KANBAN_FILTROS_STORAGE_KEY = "PAINEL_KANBAN_FILTROS";

export function readPainelKanbanFiltros(): Partial<PainelKanbanFiltrosForm> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PAINEL_KANBAN_FILTROS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PainelKanbanFiltrosForm>;
  } catch {
    return null;
  }
}

export function writePainelKanbanFiltros(
  payload: Partial<PainelKanbanFiltrosForm>,
): void {
  if (typeof window === "undefined") return;

  try {
    const current = readPainelKanbanFiltros() ?? {};
    localStorage.setItem(
      PAINEL_KANBAN_FILTROS_STORAGE_KEY,
      JSON.stringify({ ...current, ...payload }),
    );
  } catch {
    // Sem ação: storage pode estar indisponível/cheio.
  }
}

/** Nome do colaborador do filtro "Ver como" persistido no painel kanban. */
export function getColaboradorLabelFromKanbanFiltros(
  idColaborador: string,
  fallback: string,
): string {
  const colaboradorId = idColaborador.trim();
  if (!colaboradorId) return fallback;

  const saved = readPainelKanbanFiltros();
  if (!saved) return fallback;

  const savedId = saved.devAtribuido?.trim();
  const savedLabel = saved.devAtribuidoLabel?.trim();

  if (savedId === colaboradorId && savedLabel) {
    return savedLabel;
  }

  return fallback;
}
