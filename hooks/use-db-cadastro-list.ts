"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const DEBOUNCE_MS = 300;

/**
 * Enquanto `useQuery` não tem `data`, `query.data` é `undefined`. Usar `?? []`
 * com array literal criava **nova referência a cada render**, quebrando `useMemo`
 * e efeitos que dependem de `rows` (ex.: `setKanbanData(mappedRows)` em loop).
 */
const STABLE_EMPTY_ROWS: unknown[] = [];

function useCadastroUrlSync(debouncedSearch: string, statusForUrl?: string) {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams();
    const t = debouncedSearch.trim();
    if (t) params.set("search", t);
    const st = statusForUrl?.trim();
    if (st) params.set("status", st);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", next);
  }, [debouncedSearch, statusForUrl, pathname]);
}

export type CadastroListFetcherOptions = { status?: string };

interface UseDbCadastroListOptions<T> {
  queryKeyPrefix: "db-acquirers" | "db-devices" | "db-versions";
  /** Segmento extra na query key (ex.: forma da resposta da API). */
  queryKeyExtra?: string;
  /** Valor inicial do campo de busca (ex.: vindo de `searchParams` na primeira carga). */
  initialSearch: string;
  /**
   * Filtro por tipo de certificação (adquirentes). Sincroniza `status` na URL e repassa ao fetcher.
   */
  acquirerStatusFilter?: { initial: string };
  fetcher: (
    search?: string,
    options?: CadastroListFetcherOptions,
  ) => Promise<T[]>;
}

/**
 * Listagem de cadastros 100% via React Query (sem dados iniciais do RSC).
 * `staleTime` alto para revisitar a rota na SPA usar cache e parecer instantâneo.
 */
export function useDbCadastroList<T>({
  queryKeyPrefix,
  queryKeyExtra,
  initialSearch,
  acquirerStatusFilter,
  fetcher,
}: UseDbCadastroListOptions<T>) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusFilterInput, setStatusFilterInput] = useState(
    acquirerStatusFilter?.initial ?? "",
  );

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatusFilterInput(acquirerStatusFilter?.initial ?? "");
  }, [acquirerStatusFilter?.initial]);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const statusTrimmed = acquirerStatusFilter
    ? statusFilterInput.trim()
    : "";

  useCadastroUrlSync(
    debouncedSearch,
    acquirerStatusFilter ? statusTrimmed : undefined,
  );

  const trimmed = debouncedSearch.trim();

  const queryKey = acquirerStatusFilter
    ? queryKeyExtra
      ? ([queryKeyPrefix, trimmed, queryKeyExtra, statusTrimmed] as const)
      : ([queryKeyPrefix, trimmed, statusTrimmed] as const)
    : queryKeyExtra
      ? ([queryKeyPrefix, trimmed, queryKeyExtra] as const)
      : ([queryKeyPrefix, trimmed] as const);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetcher(
        trimmed || undefined,
        acquirerStatusFilter && statusTrimmed
          ? { status: statusTrimmed }
          : undefined,
      ),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    searchInput,
    setSearchInput,
    rows: (query.data ?? STABLE_EMPTY_ROWS) as T[],
    showTableSkeleton: query.isLoading,
    isError: query.isError,
    error: query.error,
    ...(acquirerStatusFilter
      ? {
          statusFilter: {
            value: statusFilterInput,
            setValue: setStatusFilterInput,
          },
        }
      : {}),
  };
}
