"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "@/services/auxiliar/usuarios";

export interface UseUsuariosParams {
  search?: string;
  enabled?: boolean;
  somente_projetos?: boolean;
}

export function useUsuarios(params?: UseUsuariosParams) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: [
      "usuarios",
      params?.search ?? "",
      params?.somente_projetos ?? true,
    ],
    queryFn: () => getUsuarios(params),
    enabled,
  });
}

/** Usuários filtrados (somente projetos). QueryKey separada para evitar colisão com "todos". */
export function useUsuariosProjetos(params?: Omit<UseUsuariosParams, "somente_projetos">) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["usuarios_projetos", params?.search ?? ""],
    queryFn: () => getUsuarios({ ...params, somente_projetos: true }),
    enabled,
  });
}

/** Lista de usuários sem filtro de projetos (relatores). QueryKey separada para evitar colisão com "projetos". */
export function useRelatores(params?: Omit<UseUsuariosParams, "somente_projetos">) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["relatores", params?.search ?? ""],
    queryFn: () => getUsuarios({ ...params, somente_projetos: false }),
    enabled,
  });
}
