"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpRiscoHistorico,
  type CreateSgpRiscoHistoricoRequest,
} from "@/services/sgp-riscos-historico/create-sgp-risco-historico";
import { invalidateSgpRiscosHistoricoQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export function useCreateSgpRiscoHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSgpRiscoHistoricoRequest) =>
      createSgpRiscoHistorico(data),
    onSuccess: (_response, variables) =>
      invalidateSgpRiscosHistoricoQueries(queryClient, variables.id_seq),
  });
}
