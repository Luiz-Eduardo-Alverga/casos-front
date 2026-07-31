import { parseAsString } from "nuqs";

export const liberacoesFiltrosParsers = {
  produtoId: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  tipoLiberacao: parseAsString.withDefault(""),
  versao: parseAsString.withDefault(""),
};
