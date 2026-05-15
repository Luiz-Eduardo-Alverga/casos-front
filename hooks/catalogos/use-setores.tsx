"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetores } from "@/services/auxiliar/setores";

export function useSetores(params?: { search?: string; enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["setores", params?.search ?? ""],
    queryFn: () => getSetores(params),
    enabled,
  });
}
