import type { DocFilters } from "@/services/db-api/docs";

export interface DocsFiltrosProps {
  filtros: DocFilters;
  onChange: <K extends keyof DocFilters>(
    key: K,
    value: DocFilters[K],
  ) => void;
  onClear: () => void;
}
