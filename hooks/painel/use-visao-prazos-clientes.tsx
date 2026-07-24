"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoPrazosClientes,
  type GetVisaoPrazosClientesParams,
} from "@/services/sprint/get-visao-prazos-clientes";

export function useVisaoPrazosClientes(
  params: GetVisaoPrazosClientesParams = {},
) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";

  return useQuery({
    queryKey: ["visao-prazos-clientes", idProjeto, produtoId, setor],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoPrazosClientes({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
      }),
  });
}
