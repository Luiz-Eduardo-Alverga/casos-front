import { parseAsStringLiteral } from "nuqs";

export const PRODUTO_EDIT_TABS = [
  "dados",
  "versoes",
  "modulos",
  "checklist",
  "scripts",
] as const;

export type ProdutoEditTab = (typeof PRODUTO_EDIT_TABS)[number];

export const produtoEditTabParser = parseAsStringLiteral(
  PRODUTO_EDIT_TABS,
).withDefault("dados");
