/** Status aceitos pela API (`Status` do `GET /sgp-cadastros`), decisão #33. */
export type ProjetoStatusFiltro = "" | "ABERTO" | "FECHADO";

export interface ProjetosFiltersForm {
  registro: string;
  /** Parte do nome (`NomeProjeto`). */
  nome: string;
  /** Id do setor (combobox); "" = Todos. */
  setor: string;
  /** "" = Todos. */
  status: ProjetoStatusFiltro;
  /** Mês `AAAA-MM`; "" = Todos os meses (decisão #32). */
  mes: string;
  /** Sem campo na tela (decisão #35); continua aceito na URL. */
  objetivo: string;
}

export type ProjetosFiltrosAplicados = ProjetosFiltersForm;

export const EMPTY_PROJETOS_FILTERS_FORM: ProjetosFiltersForm = {
  registro: "",
  nome: "",
  setor: "",
  status: "",
  mes: "",
  objetivo: "",
};

export const EMPTY_PROJETOS_FILTROS_APLICADOS: ProjetosFiltrosAplicados =
  EMPTY_PROJETOS_FILTERS_FORM;
