"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgendaDev } from "@/services/auxiliar/get-agenda-dev";

export interface UseAgendaDevOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
}

export function useAgendaDev(
  params: {
    id_colaborador: string;
    Cronograma_id?: string;
  },
  options?: UseAgendaDevOptions,
) {
  const cronogramaId = params.Cronograma_id?.trim();
  const enabled =
    (options?.enabled ?? true) && Boolean(params.id_colaborador?.trim());
  return useQuery({
    queryKey: ["agenda-dev", params.id_colaborador, cronogramaId ?? ""],
    enabled,
    queryFn: () =>
      getAgendaDev({
        id_colaborador: params.id_colaborador,
        ...(cronogramaId ? { Cronograma_id: cronogramaId } : {}),
      }),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? true,
    refetchOnWindowFocus: false,
  });
}
