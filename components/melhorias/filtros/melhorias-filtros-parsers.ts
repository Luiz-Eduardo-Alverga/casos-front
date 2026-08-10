import { parseAsString } from "nuqs";

export const melhoriasFiltrosParsers = {
  produtoId: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
  search: parseAsString.withDefault(""),
  dataInicial: parseAsString.withDefault(""),
  dataFinal: parseAsString.withDefault(""),
  lacrar: parseAsString.withDefault(""),
  concluido: parseAsString.withDefault(""),
  registro: parseAsString.withDefault(""),
};
