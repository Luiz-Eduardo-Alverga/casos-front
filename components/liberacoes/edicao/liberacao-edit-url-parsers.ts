import { parseAsStringLiteral } from "nuqs";

export const LIBERACAO_EDIT_TABS = ["liberacao", "casos-versao"] as const;

export type LiberacaoEditTab = (typeof LIBERACAO_EDIT_TABS)[number];

export const liberacaoEditTabParser = parseAsStringLiteral(
  LIBERACAO_EDIT_TABS,
).withDefault("liberacao");
