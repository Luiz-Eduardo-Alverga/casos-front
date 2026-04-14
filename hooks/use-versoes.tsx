"use client";

import { useQuery } from "@tanstack/react-query";
import { getVersoes } from "@/services/auxiliar/versoes";

export function useVersoes(params?: {
  produto_id?: string;
  search?: string;
  enabled?: boolean;
  todas?: boolean;
}) {
  const baseEnabled = Boolean(params?.produto_id);
  const enabled = baseEnabled && (params?.enabled ?? true);
  return useQuery({
    queryKey: [
      "versoes",
      params?.produto_id ?? "",
      params?.search ?? "",
      params?.todas ?? false,
    ],
    enabled,
    queryFn: () =>
      getVersoes({
        produto_id: params!.produto_id!,
        search: params?.search,
        todas: params?.todas ?? false,
      }),
  });
}

