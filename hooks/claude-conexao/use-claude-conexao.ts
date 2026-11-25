"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  desconectarClaude,
  fetchClaudeConexao,
  type ClaudeConexaoStatus,
  type TipoClienteConexao,
} from "@/services/conector-claude/conexao";

export const claudeConexaoQueryKey = ["claude-conexao"] as const;

/** Status da conexão com o Claude (pílula do menu e modal). */
export function useClaudeConexao(enabled = true) {
  return useQuery<ClaudeConexaoStatus>({
    queryKey: claudeConexaoQueryKey,
    enabled,
    queryFn: ({ signal }) => fetchClaudeConexao(signal),
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDesconectarClaude() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tipo?: TipoClienteConexao) => desconectarClaude(tipo),
    onSuccess: () => qc.invalidateQueries({ queryKey: claudeConexaoQueryKey }),
  });
}
