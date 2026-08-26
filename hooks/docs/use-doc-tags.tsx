"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { searchDocTagsClient } from "@/services/db-api/docs";

export function useDocTags(search: string, enabled = true) {
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  return useQuery({
    queryKey: ["doc-tags", debouncedSearch],
    queryFn: () => searchDocTagsClient(debouncedSearch),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
