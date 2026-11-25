import { fetchWithAuth } from "@/lib/fetch";

/** Tipo de cliente da conexão (decisão #25). */
export type TipoClienteConexao = "claude" | "claude-code";

export interface ClaudeConexao {
  tipo: TipoClienteConexao;
  /** ISO. */
  conectadoEm: string;
  /** ISO; null se ainda não usou. */
  ultimoUsoEm: string | null;
}

export interface ClaudeConexaoStatus {
  /** Há pelo menos uma conexão ativa (pílula do menu e da seção Softflow). */
  conectado: boolean;
  /** No máximo uma por tipo de cliente. */
  conexoes: ClaudeConexao[];
  podeAbrirCaso: boolean;
  /** Endereço que a pessoa cadastra no Claude (`.../api/mcp`). */
  enderecoConector: string;
  /** Conector do Brainiac recomendado (decisões #17, #18 e #21); null = variável ausente. */
  brainiac: { endereco: string | null; clientId: string | null };
}

async function parseJsonOk<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`,
    );
  }
  return json.data as T;
}

export async function fetchClaudeConexao(
  signal?: AbortSignal,
): Promise<ClaudeConexaoStatus> {
  const res = await fetchWithAuth("/api/db/claude-conexao", {
    method: "GET",
    signal,
  });
  return parseJsonOk<ClaudeConexaoStatus>(res);
}

/** Desconecta um tipo de cliente; sem `tipo`, todas as conexões da pessoa. */
export async function desconectarClaude(
  tipo?: TipoClienteConexao,
): Promise<{ revogadas: number }> {
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  const res = await fetchWithAuth(`/api/db/claude-conexao${query}`, {
    method: "DELETE",
  });
  return parseJsonOk<{ revogadas: number }>(res);
}
