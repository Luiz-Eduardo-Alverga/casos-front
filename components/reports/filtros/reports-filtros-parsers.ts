import { parseAsArrayOf, parseAsString } from "nuqs";
import { DEFAULT_REPORTS_STATUS_IDS } from "@/components/reports/types";

export const reportsFiltrosParsers = {
  setor: parseAsString.withDefault(""),
  produto: parseAsString.withDefault(""),
  status_id: parseAsArrayOf(parseAsString).withDefault([
    ...DEFAULT_REPORTS_STATUS_IDS,
  ]),
};

export type ReportsFiltrosNuqsState = {
  setor: string;
  produto: string;
  status_id: string[];
};

export type ReportsFiltrosNuqsUpdate = {
  [K in keyof ReportsFiltrosNuqsState]: ReportsFiltrosNuqsState[K] | null;
};
