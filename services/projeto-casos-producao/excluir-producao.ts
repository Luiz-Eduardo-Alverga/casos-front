import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface ExcluirProducaoResponse {
  message: string;
}

/**
 * Exclui uma produção.
 * DELETE /api/projeto-casos-producao/{sequencia} → API externa
 */
export async function excluirProducao(
  sequencia: number | string
): Promise<ExcluirProducaoResponse> {
  const token = getToken();
  const id = encodeURIComponent(String(sequencia));

  const url = new URL(
    `/api/projeto-casos-producao/${id}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.error ?? body?.message ?? "Erro ao excluir produção"
    );
  }

  return body as ExcluirProducaoResponse;
}
