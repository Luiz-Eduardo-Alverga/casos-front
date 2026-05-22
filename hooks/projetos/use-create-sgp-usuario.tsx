"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpUsuario,
  type CreateSgpUsuarioRequest,
} from "@/services/sgp-usuarios/create-sgp-usuario";
import {
  invalidateSgpUsuariosQueries,
  resolveProjetoId,
} from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseCreateSgpUsuarioOptions {
  /** ID do projeto para invalidar listagem após sucesso */
  projetoId?: number | string | null;
}

export function useCreateSgpUsuario(options?: UseCreateSgpUsuarioOptions) {
  const queryClient = useQueryClient();
  const projetoId = options?.projetoId;

  return useMutation({
    mutationFn: (data: CreateSgpUsuarioRequest) => createSgpUsuario(data),
    onSuccess: (_response, variables) =>
      invalidateSgpUsuariosQueries(
        queryClient,
        resolveProjetoId(variables.Registro, projetoId),
      ),
  });
}
