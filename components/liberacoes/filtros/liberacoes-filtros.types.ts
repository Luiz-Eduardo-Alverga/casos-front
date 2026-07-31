export interface LiberacoesFiltrosState {
  produtoId: string;
  status: string;
  tipoLiberacao: string;
  versao: string;
}

export const EMPTY_LIBERACOES_FILTROS: LiberacoesFiltrosState = {
  produtoId: "",
  status: "",
  tipoLiberacao: "",
  versao: "",
};
