"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpStake } from "@/services/sgp-stakes/delete-sgp-stake";

export interface UseDeleteSgpStakeOptions {
  projetoId?: number | string | null;
}

export function useDeleteSgpStake(options?: UseDeleteSgpStakeOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (sequencia: number | string) => deleteSgpStake(sequencia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sgp-stakes"] });
      if (projetoId != null && String(projetoId) !== "") {
        queryClient.invalidateQueries({
          queryKey: ["sgp-stakes", "projeto"],
        });
      }
    },
  });
}
