"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpStake,
  type UpdateSgpStakeRequest,
} from "@/services/sgp-stakes/update-sgp-stake";
import {
  invalidateSgpStakesQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseUpdateSgpStakeOptions {
  projetoId?: number | string | null;
}

export function useUpdateSgpStake(options?: UseUpdateSgpStakeOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: ({
      sequencia,
      data,
    }: {
      sequencia: number | string;
      data: UpdateSgpStakeRequest;
    }) => updateSgpStake(sequencia, data),
    onSuccess: (_response, variables) =>
      invalidateSgpStakesQueries(
        queryClient,
        resolveProjetoId(variables.data.Registro, projetoId),
      ),
  });
}
