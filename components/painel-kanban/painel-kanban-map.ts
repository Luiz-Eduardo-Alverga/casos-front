import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { PainelKanbanColumnId } from "@/components/painel-kanban/painel-kanban-columns";

export interface PainelKanbanItem extends Record<string, unknown> {
  id: string;
  name: string;
  column: string;
  numero: string;
  descricao: string;
  importancia: number;
  modulo: string;
  tempoEstimado: string;
  tempoRealizado: string;
  statusTempo: string;
  tipoCategoria: string;
  statusId: string;
}

function formatMinutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function mapProjetoMemoriaItemToKanban(
  item: ProjetoMemoriaItem,
  columnId: PainelKanbanColumnId,
): PainelKanbanItem {
  const prioridade = item.caso.caracteristicas.prioridade;
  const resumo = item.caso.textos.descricao_resumo ?? "";
  return {
    id: String(item.caso.id),
    name: resumo || `Caso #${item.caso.id}`,
    column: columnId,
    numero: String(item.caso.id),
    descricao: resumo,
    importancia: Number(prioridade) || 0,
    modulo: item.caso.caracteristicas.modulo ?? "",
    tempoEstimado: formatMinutesToHHMM(item.caso.tempos.estimado_minutos),
    tempoRealizado: formatMinutesToHHMM(item.caso.tempos.realizado_minutos),
    statusTempo: item.caso.tempos.status_tempo ?? "",
    tipoCategoria: item.caso.caracteristicas.tipo_categoria ?? "",
    statusId: item.caso.status.status_id ?? "",
  };
}

export function sortAbertosIniciadosPrimeiro(items: PainelKanbanItem[]) {
  return [...items].sort((a, b) =>
    a.statusTempo === "INICIADO" ? -1 : b.statusTempo === "INICIADO" ? 1 : 0,
  );
}

/**
 * Remove duplicatas por `id`, mantendo a primeira ocorrência na ordem do array.
 * Útil ao unir listas por status quando a API pode devolver o mesmo caso em mais de uma query.
 */
export function dedupePainelKanbanItemsById(
  items: PainelKanbanItem[],
): PainelKanbanItem[] {
  const byId = new Map<string, PainelKanbanItem>();
  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}
