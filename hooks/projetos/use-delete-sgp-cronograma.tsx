"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpCronograma } from "@/services/sgp-cronograma/delete-sgp-cronograma";
import { invalidateSgpCronogramaQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseDeleteSgpCronogramaOptions {
  projetoId?: number | string | null;
}

export function useDeleteSgpCronograma(
  options?: UseDeleteSgpCronogramaOptions,
) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (sequencia: number | string) => deleteSgpCronograma(sequencia),
    onSuccess: () => invalidateSgpCronogramaQueries(queryClient, projetoId),
  });
}
