"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpStake,
  type CreateSgpStakeRequest,
} from "@/services/sgp-stakes/create-sgp-stake";

export interface UseCreateSgpStakeOptions {
  /** ID do projeto para invalidar listagem de stakes após sucesso */
  projetoId?: number | string | null;
}

export function useCreateSgpStake(options?: UseCreateSgpStakeOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (data: CreateSgpStakeRequest) => createSgpStake(data),
    onSuccess: (_response, variables) => {
      const registro = variables.Registro ?? projetoId;
      queryClient.invalidateQueries({ queryKey: ["sgp-stakes"] });
      if (registro != null && String(registro) !== "") {
        queryClient.invalidateQueries({
          queryKey: ["sgp-stakes", "projeto"],
        });
      }
    },
  });
}
