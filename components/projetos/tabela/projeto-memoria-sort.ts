export type ProjetoMemoriaSortField =
  | "numero_caso"
  | "produto_nome"
  | "data_conclusao_dev";

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
};
