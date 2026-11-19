"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clonarSgpCadastro,
  type ClonarSgpCadastroRequest,
} from "@/services/sgp-cadastros/clonar-sgp-cadastro";

export interface ClonarSgpCadastroVariables {
  /** Registro do projeto de origem */
  origemId: number | string;
  data: ClonarSgpCadastroRequest;
}

/** Clona um projeto e recarrega a listagem (`["sgp-cadastros"]`). */
export function useClonarSgpCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ origemId, data }: ClonarSgpCadastroVariables) =>
      clonarSgpCadastro(origemId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sgp-cadastros"] }),
  });
}
