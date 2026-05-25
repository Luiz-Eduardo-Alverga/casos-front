"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpRisco,
  type CreateSgpRiscoRequest,
} from "@/services/sgp-riscos/create-sgp-risco";
import {
  invalidateSgpRiscosQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseCreateSgpRiscoOptions {
  projetoId?: number | string | null;
}

export function useCreateSgpRisco(options?: UseCreateSgpRiscoOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (data: CreateSgpRiscoRequest) => createSgpRisco(data),
    onSuccess: (_response, variables) =>
      invalidateSgpRiscosQueries(
        queryClient,
        resolveProjetoId(variables.sgp_cadastro_id, projetoId),
      ),
  });
}
