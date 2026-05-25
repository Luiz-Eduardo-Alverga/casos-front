"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpRiscoHistorico } from "@/services/sgp-riscos-historico/delete-sgp-risco-historico";
import { invalidateSgpRiscosHistoricoQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface DeleteSgpRiscoHistoricoVariables {
  id: number | string;
  id_seq: number | string;
}

export function useDeleteSgpRiscoHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteSgpRiscoHistoricoVariables) =>
      deleteSgpRiscoHistorico(id),
    onSuccess: (_response, variables) =>
      invalidateSgpRiscosHistoricoQueries(queryClient, variables.id_seq),
  });
}
