export interface MelhoriasFiltrosState {
  produtoId: string;
  setor: string;
  search: string;
  dataInicial: string;
  dataFinal: string;
  lacrar: string;
  concluido: string;
  registro: string;
}

export const EMPTY_MELHORIAS_FILTROS: MelhoriasFiltrosState = {
  produtoId: "",
  setor: "",
  search: "",
  dataInicial: "",
  dataFinal: "",
  lacrar: "",
  concluido: "",
  registro: "",
};
