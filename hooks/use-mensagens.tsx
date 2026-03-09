"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getMensagens,
  type GetMensagensParams,
  type MensagensResponse,
} from "@/services/mensagens/get-mensagens";

export function useMensagens(
  params?: GetMensagensParams,
  options?: Omit<UseQueryOptions<MensagensResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["mensagens", params?.id, params?.lido, params?.data_msg_inicio, params?.data_msg_fim],
    queryFn: () => getMensagens(params),
    ...options,
  });
}
