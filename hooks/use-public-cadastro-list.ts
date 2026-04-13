"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const DEBOUNCE_MS = 300;
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

export type PublicCadastroListFetcherOptions = { status?: string };

interface UsePublicCadastroListOptions<T> {
  queryKeyPrefix: string;
  queryKeyExtra?: string;
  initialSearch: string;
  statusFilter?: { initial: string };
  fetcher: (
    search?: string,
    options?: PublicCadastroListFetcherOptions,
  ) => Promise<T[]>;
}

export function usePublicCadastroList<T>({
  queryKeyPrefix,
  queryKeyExtra,
  initialSearch,
  statusFilter,
  fetcher,
}: UsePublicCadastroListOptions<T>) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusFilterInput, setStatusFilterInput] = useState(
    statusFilter?.initial ?? "",
  );

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatusFilterInput(statusFilter?.initial ?? "");
  }, [statusFilter?.initial]);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const statusTrimmed = statusFilter ? statusFilterInput.trim() : "";

  useCadastroUrlSync(debouncedSearch, statusFilter ? statusTrimmed : undefined);

  const trimmed = debouncedSearch.trim();

  const queryKey = statusFilter
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
        statusFilter && statusTrimmed ? { status: statusTrimmed } : undefined,
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
    ...(statusFilter
      ? {
          statusFilter: {
            value: statusFilterInput,
            setValue: setStatusFilterInput,
          },
        }
      : {}),
  };
}

