"use client";

import { useQuery } from "@tanstack/react-query";
import { listDocCategoriesClient } from "@/services/db-api/docs";

export function useDocCategories() {
  return useQuery({
    queryKey: ["doc-categories"],
    queryFn: listDocCategoriesClient,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
