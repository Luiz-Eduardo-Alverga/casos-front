"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const DEBOUNCE_MS = 300;

function useSearchUrlSync(debouncedSearch: string) {
  const pathname = usePathname();

  useEffect(() => {
    const t = debouncedSearch.trim();
    const params = new URLSearchParams();
    if (t) params.set("search", t);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", next);
  }, [debouncedSearch, pathname]);
}

interface UseDbCadastroListOptions<T> {
  queryKeyPrefix: "db-acquirers" | "db-devices" | "db-versions";
  initialData: T[];
  initialSearch: string;
  fetcher: (search?: string) => Promise<T[]>;
}

export function useDbCadastroList<T>({
  queryKeyPrefix,
  initialData,
  initialSearch,
  fetcher,
}: UseDbCadastroListOptions<T>) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const hasUserChangedSearch = useRef(false);

  useEffect(() => {
    setSearchInput(initialSearch);
    hasUserChangedSearch.current = false;
  }, [initialSearch]);

  useEffect(() => {
    if (searchInput.trim() !== initialSearch.trim()) {
      hasUserChangedSearch.current = true;
    }
  }, [searchInput, initialSearch]);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  useSearchUrlSync(debouncedSearch);

  const trimmed = debouncedSearch.trim();
  const trimmedInitial = initialSearch.trim();
  const useSsrInitial =
    !hasUserChangedSearch.current && trimmed === trimmedInitial;

  const query = useQuery({
    queryKey: [queryKeyPrefix, trimmed] as const,
    queryFn: () => fetcher(trimmed || undefined),
    initialData: useSsrInitial ? initialData : undefined,
    staleTime: useSsrInitial ? 60_000 : 0,
    refetchOnMount: !useSsrInitial,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    searchInput,
    setSearchInput,
    rows: query.data ?? [],
    showTableSkeleton: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
