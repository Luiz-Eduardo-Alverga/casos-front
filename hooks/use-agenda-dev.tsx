"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgendaDev } from "@/services/auxiliar/get-agenda-dev";

export function useAgendaDev(params: { id_colaborador: string }) {
  return useQuery({
    queryKey: ["agenda-dev", params.id_colaborador],
    enabled: Boolean(params.id_colaborador),
    queryFn: () => getAgendaDev({ id_colaborador: params.id_colaborador }),
  });
}
