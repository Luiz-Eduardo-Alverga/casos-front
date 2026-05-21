"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpStake,
  type UpdateSgpStakeRequest,
} from "@/services/sgp-stakes/update-sgp-stake";

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
    onSuccess: (_response, variables) => {
      const registro = variables.data.Registro ?? projetoId;
      queryClient.invalidateQueries({ queryKey: ["sgp-stakes"] });
      if (registro != null && String(registro) !== "") {
        queryClient.invalidateQueries({
          queryKey: ["sgp-stakes", "projeto"],
        });
      }
    },
  });
}
