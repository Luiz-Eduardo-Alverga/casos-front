"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpCadastro,
  type UpdateSgpCadastroRequest,
} from "@/services/sgp-cadastros/update-sgp-cadastro";

export function useUpdateSgpCadastro(projetoScopeId?: string | number | null) {
  const queryClient = useQueryClient();
  const mutationKey =
    projetoScopeId != null && String(projetoScopeId) !== ""
      ? (["update-sgp-cadastro", String(projetoScopeId)] as const)
      : undefined;

  return useMutation({
    ...(mutationKey ? { mutationKey: [...mutationKey] } : {}),
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateSgpCadastroRequest;
    }) => updateSgpCadastro(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sgp-cadastros"] });
      queryClient.invalidateQueries({
        queryKey: ["sgp-cadastro", variables.id],
      });
    },
  });
}
