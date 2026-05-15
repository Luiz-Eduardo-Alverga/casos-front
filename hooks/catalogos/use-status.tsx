"use client";

import { useQuery } from "@tanstack/react-query";
import { getStatus } from "@/services/auxiliar/status";

export function useStatus(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["status"],
    queryFn: () => getStatus(),
    enabled,
  });
}
