"use client";

import { useQuery } from "@tanstack/react-query";
import { getCasoHistorico } from "@/services/projeto-casos/get-historico";

export function useCasoHistorico(params?: {
  registro?: number | string;
  enabled?: boolean;
}) {
  const baseEnabled = Boolean(params?.registro);
  const enabled = baseEnabled && (params?.enabled ?? true);

  return useQuery({
    queryKey: ["projeto-casos-historico", String(params?.registro ?? "")],
    enabled,
    queryFn: () => getCasoHistorico({ registro: params!.registro! }),
  });
}
