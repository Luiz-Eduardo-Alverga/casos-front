"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpUsuario } from "@/services/sgp-usuarios/delete-sgp-usuario";
import { invalidateSgpUsuariosQueries } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseDeleteSgpUsuarioOptions {
  projetoId?: number | string | null;
}

export function useDeleteSgpUsuario(options?: UseDeleteSgpUsuarioOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (sequencia: number | string) => deleteSgpUsuario(sequencia),
    onSuccess: () => invalidateSgpUsuariosQueries(queryClient, projetoId),
  });
}
