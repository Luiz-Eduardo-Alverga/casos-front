"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpStake } from "@/services/sgp-stakes/delete-sgp-stake";
import { invalidateSgpStakesQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseDeleteSgpStakeOptions {
  projetoId?: number | string | null;
}

export function useDeleteSgpStake(options?: UseDeleteSgpStakeOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (sequencia: number | string) => deleteSgpStake(sequencia),
    onSuccess: () => invalidateSgpStakesQueries(queryClient, projetoId),
  });
}
