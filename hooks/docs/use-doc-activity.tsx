"use client";

import { useQuery } from "@tanstack/react-query";
import { listDocActivityClient } from "@/services/db-api/docs";

export function useDocActivity(id: string | null, isHistoryActive: boolean) {
  return useQuery({
    queryKey: ["doc", id, "activity"],
    queryFn: () => listDocActivityClient(id!),
    enabled: Boolean(id) && isHistoryActive,
    refetchOnWindowFocus: false,
  });
}
