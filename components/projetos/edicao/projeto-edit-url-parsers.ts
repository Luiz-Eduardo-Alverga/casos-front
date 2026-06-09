import { parseAsStringLiteral } from "nuqs";

export const PROJETO_EDIT_TABS = [
  "abertura",
  "stakes",
  "cronograma",
  "escopo",
  "risco",
] as const;

export type ProjetoEditTab = (typeof PROJETO_EDIT_TABS)[number];

export const projetoEditTabParser = parseAsStringLiteral(PROJETO_EDIT_TABS).withDefault(
  "abertura",
);
