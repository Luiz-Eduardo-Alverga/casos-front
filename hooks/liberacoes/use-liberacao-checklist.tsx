"use client";

import { useQuery } from "@tanstack/react-query";
import { getLiberacaoChecklist } from "@/services/sprint/get-liberacao-checklist";

export interface UseLiberacaoChecklistOptions {
  enabled?: boolean;
}

export function useLiberacaoChecklist(
  registro: number | string | null | undefined,
  options?: UseLiberacaoChecklistOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = registro != null && registro !== "" && enabled;

  return useQuery({
    queryKey: ["liberacoes", registro, "checklist"],
    queryFn: () => getLiberacaoChecklist(registro as number | string),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
  });
}
