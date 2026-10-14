import { parseAsArrayOf, parseAsString } from "nuqs";
import { DEFAULT_REPORTS_STATUS_IDS } from "../types";

export const reportsFiltrosParsers = {
  setor: parseAsString.withDefault(""),
  produto: parseAsString.withDefault(""),
  tipo_categoria: parseAsString.withDefault(""),
  status_id: parseAsArrayOf(parseAsString).withDefault([
    ...DEFAULT_REPORTS_STATUS_IDS,
  ]),
};

export type ReportsFiltrosNuqsState = {
  setor: string;
  produto: string;
  tipo_categoria: string;
  status_id: string[];
};

export type ReportsFiltrosNuqsUpdate = {
  [K in keyof ReportsFiltrosNuqsState]: ReportsFiltrosNuqsState[K] | null;
};
