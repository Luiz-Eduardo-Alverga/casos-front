"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpCronograma,
  type CreateSgpCronogramaRequest,
} from "@/services/sgp-cronograma/create-sgp-cronograma";
import {
  invalidateSgpCronogramaQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseCreateSgpCronogramaOptions {
  projetoId?: number | string | null;
}

export function useCreateSgpCronograma(
  options?: UseCreateSgpCronogramaOptions,
) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (data: CreateSgpCronogramaRequest) => createSgpCronograma(data),
    onSuccess: (_response, variables) =>
      invalidateSgpCronogramaQueries(
        queryClient,
        resolveProjetoId(variables.Registro, projetoId),
      ),
  });
}
