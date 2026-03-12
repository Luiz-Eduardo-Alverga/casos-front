"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "@/services/auxiliar/usuarios";

export function useUsuarios(params?: { search?: string; enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["usuarios", params?.search ?? ""],
    queryFn: () => getUsuarios(params),
    enabled,
  });
}
