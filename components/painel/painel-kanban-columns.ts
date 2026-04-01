export const PAINEL_KANBAN_COLUMN_IDS = [
  "abertos",
  "corrigidos",
  "retornos",
  "concluidos",
] as const;

export type PainelKanbanColumnId = (typeof PAINEL_KANBAN_COLUMN_IDS)[number];

export interface PainelKanbanColumnMeta extends Record<string, unknown> {
  id: PainelKanbanColumnId;
  name: string;
  dotClass: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const PAINEL_KANBAN_COLUMNS: PainelKanbanColumnMeta[] = [
  {
    id: "abertos",
    name: "Abertos",
    dotClass: "bg-blue-500",
    emptyTitle: "Nenhum caso aberto",
    emptyDescription: "Não há casos neste status para os filtros selecionados.",
  },
  {
    id: "corrigidos",
    name: "Corrigidos",
    dotClass: "bg-green-500",
    emptyTitle: "Nenhum corrigido",
    emptyDescription: "Não há casos corrigidos aguardando validação.",
  },
  {
    id: "retornos",
    name: "Retornos",
    dotClass: "bg-orange-500",
    emptyTitle: "Nenhum retorno",
    emptyDescription:
      "Não há itens devolvidos pelo QA no momento.",
  },
  {
    id: "concluidos",
    name: "Concluídos",
    dotClass: "bg-green-500",
    emptyTitle: "Nenhum concluído",
    emptyDescription: "Não há casos concluídos para os filtros selecionados.",
  },
];

/** status enviado na API ao mover cartão para a coluna (abertos usa 1). */
export function columnIdToApiStatus(columnId: PainelKanbanColumnId): number {
  switch (columnId) {
    case "abertos":
      return 1;
    case "corrigidos":
      return 3;
    case "retornos":
      return 4;
    case "concluidos":
      return 9;
    default:
      return 1;
  }
}
