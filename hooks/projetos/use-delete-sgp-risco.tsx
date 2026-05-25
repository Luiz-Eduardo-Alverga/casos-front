"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpRisco } from "@/services/sgp-riscos/delete-sgp-risco";
import { invalidateSgpRiscosQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseDeleteSgpRiscoOptions {
  projetoId?: number | string | null;
}

export function useDeleteSgpRisco(options?: UseDeleteSgpRiscoOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (sequencia: number | string) => deleteSgpRisco(sequencia),
    onSuccess: () => invalidateSgpRiscosQueries(queryClient, projetoId),
  });
}
