"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCasoAberto,
  type GetCasoAbertoResponse,
} from "@/services/projeto-casos-producao/get-caso-aberto";
import type { IniciarProducaoData } from "@/services/projeto-casos-producao/iniciar-producao";

export function useCasoAberto(params?: {
  usuario?: number | string;
  enabled?: boolean;
}) {
  const baseEnabled = Boolean(params?.usuario);
  const enabled = baseEnabled && (params?.enabled ?? true);

  return useQuery({
    queryKey: ["caso-aberto", String(params?.usuario ?? "")],
    enabled,
    queryFn: () => getCasoAberto({ usuario: params!.usuario! }),
  });
}

export type { GetCasoAbertoResponse, IniciarProducaoData as CasoAbertoData };
