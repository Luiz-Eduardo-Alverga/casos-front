"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transferirProximoProjeto,
  type TransferirProximoProjetoRequest,
} from "@/services/projeto-casos/transferir-proximo-projeto";

export function useTransferirProximoProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TransferirProximoProjetoRequest) =>
      transferirProximoProjeto(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    },
  });
}
