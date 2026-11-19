import { fetchWithAuth } from "@/lib/fetch";

export interface ClaudeConexaoStatus {
  conectado: boolean;
  /** ISO; null sem conexão. */
  conectadoEm: string | null;
  /** ISO; null se o Claude ainda não usou. */
  ultimoUsoEm: string | null;
  podeAbrirCaso: boolean;
  /** Endereço que a pessoa cadastra no Claude (`.../api/mcp`). */
  enderecoConector: string;
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

export async function desconectarClaude(): Promise<{ revogadas: number }> {
  const res = await fetchWithAuth("/api/db/claude-conexao", {
    method: "DELETE",
  });
  return parseJsonOk<{ revogadas: number }>(res);
}
