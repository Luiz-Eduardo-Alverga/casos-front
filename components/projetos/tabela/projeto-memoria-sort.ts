export type ProjetoMemoriaSortField =
  | "numero_caso"
  | "produto_nome"
  | "prioridade"
  | "data_conclusao_dev"
  | "tempo_estimado";

export type ProjetoMemoriaSortOrder = "ASC" | "DESC";

export interface ProjetoMemoriaSortState {
  sort_by?: ProjetoMemoriaSortField;
  sort_order?: ProjetoMemoriaSortOrder;
}

export interface ProjetoMemoriaSortOptionItem {
  label: string;
  hint: string;
}

export interface ProjetoMemoriaSortColumnConfig {
  asc: ProjetoMemoriaSortOptionItem;
  desc: ProjetoMemoriaSortOptionItem;
}

export const PROJETO_MEMORIA_SORT_OPTIONS: Record<
  ProjetoMemoriaSortField,
  ProjetoMemoriaSortColumnConfig
> = {
  numero_caso: {
    asc: {
      label: "Ordenar por ID (Crescente)",
      hint: "Do menor para o maior número",
    },
    desc: {
      label: "Ordenar por ID (Decrescente)",
      hint: "Do maior para o menor número",
    },
  },
  produto_nome: {
    asc: {
      label: "Ordenar por Produto (A-Z)",
      hint: "Ordem alfabética crescente",
    },
    desc: {
      label: "Ordenar por Produto (Z-A)",
      hint: "Ordem alfabética decrescente",
    },
  },
  prioridade: {
    asc: {
      label: "Ordenar por Prioridade (Menor)",
      hint: "Importâncias mais baixas primeiro",
    },
    desc: {
      label: "Ordenar por Prioridade (Maior)",
      hint: "Importâncias mais altas primeiro",
    },
  },
  data_conclusao_dev: {
    asc: {
      label: "Ordenar por Conclusão dev (Mais antiga)",
      hint: "Datas mais antigas primeiro",
    },
    desc: {
      label: "Ordenar por Conclusão dev (Mais recente)",
      hint: "Datas mais recentes primeiro",
    },
  },
  tempo_estimado: {
    asc: {
      label: "Ordenar por Estimativa (Menor)",
      hint: "Menor tempo estimado primeiro",
    },
    desc: {
      label: "Ordenar por Estimativa (Maior)",
      hint: "Maior tempo estimado primeiro",
    },
  },
};

export function getProjetoMemoriaSortActiveLabel(
  sort: ProjetoMemoriaSortState,
): string | null {
  if (!sort.sort_by || !sort.sort_order) return null;
  const options = PROJETO_MEMORIA_SORT_OPTIONS[sort.sort_by];
  return sort.sort_order === "ASC" ? options.asc.label : options.desc.label;
}
