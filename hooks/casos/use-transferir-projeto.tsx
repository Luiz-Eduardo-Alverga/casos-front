"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transferirProjeto,
  type TransferirProjetoRequest,
} from "@/services/projeto-casos/transferir-projeto";

export function useTransferirProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number | string } & TransferirProjetoRequest) =>
      transferirProjeto(params.id, {
        cronograma_destino: params.cronograma_destino,
        duplicar: params.duplicar,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    },
  });
}
