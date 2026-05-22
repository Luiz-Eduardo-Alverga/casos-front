"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSgpCronograma,
  type UpdateSgpCronogramaRequest,
} from "@/services/sgp-cronograma/update-sgp-cronograma";
import {
  invalidateSgpCronogramaQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseUpdateSgpCronogramaOptions {
  projetoId?: number | string | null;
}

export function useUpdateSgpCronograma(
  options?: UseUpdateSgpCronogramaOptions,
) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: ({
      sequencia,
      data,
    }: {
      sequencia: number | string;
      data: UpdateSgpCronogramaRequest;
    }) => updateSgpCronograma(sequencia, data),
    onSuccess: (_response, variables) =>
      invalidateSgpCronogramaQueries(
        queryClient,
        resolveProjetoId(variables.data.Registro, projetoId),
      ),
  });
}
