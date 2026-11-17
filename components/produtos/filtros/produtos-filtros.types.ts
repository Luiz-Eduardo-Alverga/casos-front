import { parseAsBoolean, parseAsString } from "nuqs";

export const produtosFiltrosParsers = {
  nome: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
  /** Padrão true: a listagem abre incluindo os produtos desativados. */
  desativados: parseAsBoolean.withDefault(true),
};

export type ProdutosFiltrosAplicados = {
  nome: string;
  setor: string;
  incluirDesativados: boolean;
};

/** Filtros de texto (os que o campo e o badge limpam com `undefined`). */
export type ProdutosFiltroTexto = "nome" | "setor";

export const EMPTY_PRODUTOS_FILTROS: ProdutosFiltrosAplicados = {
  nome: "",
  setor: "",
  incluirDesativados: true,
};
