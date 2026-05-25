"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpRiscoHistorico,
  type UpdateSgpRiscoHistoricoRequest,
} from "@/services/sgp-riscos-historico/update-sgp-risco-historico";
import { invalidateSgpRiscosHistoricoQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UpdateSgpRiscoHistoricoVariables {
  id: number | string;
  data: UpdateSgpRiscoHistoricoRequest;
}

export function useUpdateSgpRiscoHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateSgpRiscoHistoricoVariables) =>
      updateSgpRiscoHistorico(id, data),
    onSuccess: (_response, variables) =>
      invalidateSgpRiscosHistoricoQueries(
        queryClient,
        variables.data.id_seq,
      ),
  });
}
