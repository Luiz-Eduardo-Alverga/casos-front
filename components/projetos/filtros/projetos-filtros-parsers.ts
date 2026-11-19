import { parseAsString } from "nuqs";

/** Filtros da listagem na URL (decisão #36). */
export const projetosFiltrosParsers = {
  registro: parseAsString.withDefault(""),
  nome: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  mes: parseAsString.withDefault(""),
  objetivo: parseAsString.withDefault(""),
};

export type ProjetosFiltrosNuqsState = {
  registro: string;
  nome: string;
  setor: string;
  status: string;
  mes: string;
  objetivo: string;
};

export type ProjetosFiltrosNuqsUpdate = {
  [K in keyof ProjetosFiltrosNuqsState]: ProjetosFiltrosNuqsState[K] | null;
};
