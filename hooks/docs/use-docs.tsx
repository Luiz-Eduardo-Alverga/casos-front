"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  listDocsClient,
  type DocFilters,
} from "@/services/db-api/docs";

export function useDocs(filters: DocFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["docs", filters],
    queryFn: ({ pageParam }) => listDocsClient(filters, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    refetchOnWindowFocus: false,
  });
}
