import { parseAsString } from "nuqs";

export const projetosFiltrosParsers = {
  registro: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
  objetivo: parseAsString.withDefault(""),
};

export type ProjetosFiltrosNuqsState = {
  registro: string;
  setor: string;
  objetivo: string;
};

export type ProjetosFiltrosNuqsUpdate = {
  [K in keyof ProjetosFiltrosNuqsState]: ProjetosFiltrosNuqsState[K] | null;
};
