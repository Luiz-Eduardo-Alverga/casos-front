"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpRisco,
  type UpdateSgpRiscoRequest,
} from "@/services/sgp-riscos/update-sgp-risco";
import {
  invalidateSgpRiscosQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseUpdateSgpRiscoOptions {
  projetoId?: number | string | null;
}

export interface UpdateSgpRiscoVariables {
  sequencia: number | string;
  data: UpdateSgpRiscoRequest;
}

export function useUpdateSgpRisco(options?: UseUpdateSgpRiscoOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: ({ sequencia, data }: UpdateSgpRiscoVariables) =>
      updateSgpRisco(sequencia, data),
    onSuccess: (_response, variables) =>
      invalidateSgpRiscosQueries(
        queryClient,
        resolveProjetoId(variables.data.sgp_cadastro_id, projetoId),
      ),
  });
}
