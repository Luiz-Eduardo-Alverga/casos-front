import { parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";
import {
  DEFAULT_REPORTS_STATUS_IDS,
  type ReportsViewMode,
} from "@/components/reports/types";

export const REPORTS_VIEW_QUERY_KEY = "view";

export const reportsFiltrosParsers = {
  setor: parseAsString.withDefault(""),
  produto: parseAsString.withDefault(""),
  tipo_categoria: parseAsString.withDefault(""),
  status_id: parseAsArrayOf(parseAsString).withDefault([
    ...DEFAULT_REPORTS_STATUS_IDS,
  ]),
  view: parseAsStringLiteral(["cards", "split"] as const).withDefault("cards"),
};

export type ReportsFiltrosOnlyNuqsState = {
  setor: string;
  produto: string;
  tipo_categoria: string;
  status_id: string[];
};

export type ReportsFiltrosNuqsState = ReportsFiltrosOnlyNuqsState & {
  view: ReportsViewMode;
};

export type ReportsFiltrosNuqsUpdate = {
  [K in keyof ReportsFiltrosOnlyNuqsState]: ReportsFiltrosOnlyNuqsState[K] | null;
} & {
  view?: ReportsViewMode | null;
};
