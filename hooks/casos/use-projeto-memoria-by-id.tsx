"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjetoMemoriaById } from "@/services/projeto-memoria/get-projeto-memoria";
import { isHttpError } from "@/lib/http-error";

export interface UseProjetoMemoriaByIdOptions {
  enabled?: boolean;
}

export function useProjetoMemoriaById(
  id: number | string | null | undefined,
  options?: UseProjetoMemoriaByIdOptions
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = id != null && id !== "" && enabled;

  return useQuery({
    queryKey: ["projeto-memoria", id],
    queryFn: () => getProjetoMemoriaById(id as number | string),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
