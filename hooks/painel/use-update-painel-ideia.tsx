"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updatePainelIdeia,
  type UpdatePainelIdeiaRequest,
} from "@/services/painel-ideias/update-painel-ideia";

export interface UpdatePainelIdeiaVariables {
  id: number | string;
  data: UpdatePainelIdeiaRequest;
}

export function useUpdatePainelIdeia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePainelIdeiaVariables) =>
      updatePainelIdeia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["painel-ideias"] });
    },
  });
}
