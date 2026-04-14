"use client";

import { useMemo } from "react";
import { usePublicCadastroList } from "@/hooks/use-public-cadastro-list";
import {
  getPublicAcquirers,
  type PublicAcquirerListItem,
} from "@/services/public-api/list-acquirers";

/**
 * Lista pública de adquirentes (React Query → `getPublicAcquirers` → `/api/public/acquirers`).
 * `rows` já vêm filtradas (`isActive === true`) e ordenadas para a grade.
 */
export function usePublicAcquirersList(initialSearch: string, initialStatus: string) {
  const cadastro = usePublicCadastroList<PublicAcquirerListItem>({
    queryKeyPrefix: "public-acquirers",
    queryKeyExtra: "expand-status",
    initialSearch,
    statusFilter: { initial: initialStatus },
    fetcher: (search, opts) =>
      getPublicAcquirers({
        search,
        status: opts?.status,
      }),
  });

  const rows = useMemo(() => {
    const activeOnly = cadastro.rows.filter((r) => r.isActive === true);
    return [...activeOnly].sort((a, b) => {
      const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.acquirer.name.localeCompare(b.acquirer.name, "pt-BR");
    });
  }, [cadastro.rows]);

  return {
    searchInput: cadastro.searchInput,
    setSearchInput: cadastro.setSearchInput,
    statusFilter: cadastro.statusFilter,
    rows,
    showTableSkeleton: cadastro.showTableSkeleton,
    isError: cadastro.isError,
    error: cadastro.error,
  };
}

