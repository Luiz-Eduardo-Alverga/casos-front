"use client";

import { useQuery } from "@tanstack/react-query";
import { getCasoRelacoes } from "@/services/projeto-casos-relacoes/get";

export function useCasoRelacoes(params?: {
  registro?: number | string;
  enabled?: boolean;
}) {
  const baseEnabled = Boolean(params?.registro);
  const enabled = baseEnabled && (params?.enabled ?? true);

  return useQuery({
    queryKey: ["projeto-casos-relacoes", String(params?.registro ?? "")],
    enabled,
    queryFn: () => getCasoRelacoes({ registro: params!.registro! }),
  });
}

