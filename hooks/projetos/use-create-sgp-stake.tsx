"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpStake,
  type CreateSgpStakeRequest,
} from "@/services/sgp-stakes/create-sgp-stake";
import {
  invalidateSgpStakesQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseCreateSgpStakeOptions {
  /** ID do projeto para invalidar listagem de stakes após sucesso */
  projetoId?: number | string | null;
}

export function useCreateSgpStake(options?: UseCreateSgpStakeOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (data: CreateSgpStakeRequest) => createSgpStake(data),
    onSuccess: (_response, variables) =>
      invalidateSgpStakesQueries(
        queryClient,
        resolveProjetoId(variables.Registro, projetoId),
      ),
  });
}
