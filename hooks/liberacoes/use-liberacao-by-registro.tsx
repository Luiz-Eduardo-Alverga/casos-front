"use client";

import { useQuery } from "@tanstack/react-query";
import { getLiberacaoByRegistro } from "@/services/sprint/get-liberacao-by-registro";
import { isHttpError } from "@/lib/http-error";

export interface UseLiberacaoByRegistroOptions {
  enabled?: boolean;
}

export function useLiberacaoByRegistro(
  registro: number | string | null | undefined,
  options?: UseLiberacaoByRegistroOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = registro != null && registro !== "" && enabled;

  return useQuery({
    queryKey: ["liberacoes", registro],
    queryFn: () => getLiberacaoByRegistro(registro as number | string),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
