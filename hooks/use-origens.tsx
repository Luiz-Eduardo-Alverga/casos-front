"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrigens } from "@/services/auxiliar/origens";

export function useOrigens(params?: { search?: string; enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["origens", params?.search ?? ""],
    queryFn: () => getOrigens(params),
    enabled,
  });
}
