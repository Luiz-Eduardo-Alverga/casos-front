export interface ProjetosFiltersForm {
  registro: string;
  setor: string;
  objetivo: string;
}

export interface ProjetosFiltrosAplicados {
  registro: string;
  setor: string;
  objetivo: string;
}

export const EMPTY_PROJETOS_FILTERS_FORM: ProjetosFiltersForm = {
  registro: "",
  setor: "",
  objetivo: "",
};

export const EMPTY_PROJETOS_FILTROS_APLICADOS: ProjetosFiltrosAplicados = {
  registro: "",
  setor: "",
  objetivo: "",
};
