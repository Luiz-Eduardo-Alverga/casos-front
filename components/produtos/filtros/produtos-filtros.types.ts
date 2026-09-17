import { parseAsString } from "nuqs";

export const produtosFiltrosParsers = {
  nome: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
};

export type ProdutosFiltrosAplicados = {
  nome: string;
  setor: string;
};

export const EMPTY_PRODUTOS_FILTROS: ProdutosFiltrosAplicados = {
  nome: "",
  setor: "",
};
