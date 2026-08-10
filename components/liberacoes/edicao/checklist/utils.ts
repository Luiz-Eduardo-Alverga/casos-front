import type { LiberacaoChecklistItem } from "@/interfaces/liberacao";

export interface ChecklistRowState {
  id: number;
  liberacaoId: number;
  descricaoItem: string;
  checado: boolean;
  ordenacao: number;
  observacao: string;
  alteracaoUsuario: string;
  alteracaoDatahora: string;
  idResponsavel: number;
}

export type ChecklistFilter = "todos" | "pendentes" | "concluidos";

export interface ChecklistProgress {
  total: number;
  concluidos: number;
  pendentes: number;
  percent: number;
}

export function mapLiberacaoChecklistItemToRow(
  item: LiberacaoChecklistItem,
): ChecklistRowState {
  return {
    id: item.id,
    liberacaoId: item.liberacao_id,
    descricaoItem: item.descricao_item,
    checado: Boolean(item.checado),
    ordenacao: item.ordenacao,
    observacao: item.observacao ?? "",
    alteracaoUsuario: item.alteracao_usuario,
    alteracaoDatahora: item.alteracao_datahora,
    idResponsavel: item.id_responsavel,
  };
}

export function getChecklistProgress(
  rows: ChecklistRowState[],
): ChecklistProgress {
  const total = rows.length;
  const concluidos = rows.filter((row) => row.checado).length;
  const pendentes = total - concluidos;
  const percent = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  return { total, concluidos, pendentes, percent };
}

export function filterChecklistRows(
  rows: ChecklistRowState[],
  filter: ChecklistFilter,
): ChecklistRowState[] {
  if (filter === "pendentes") {
    return rows.filter((row) => !row.checado);
  }
  if (filter === "concluidos") {
    return rows.filter((row) => row.checado);
  }
  return rows;
}
