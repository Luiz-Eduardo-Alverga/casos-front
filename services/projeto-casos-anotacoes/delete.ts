import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface DeleteAnotacaoResponse {
  message: string;
}

/**
 * Exclui uma anotação pelo ID (sequência).
 * DELETE /api/projeto-casos-anotacoes/{id} → API externa DELETE /projeto-casos-anotacoes/{id}
 */
export async function deleteAnotacao(
  id: number | string
): Promise<DeleteAnotacaoResponse> {
  const token = getToken();

  const url = new URL(
    `/api/projeto-casos-anotacoes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao excluir anotação"
    );
  }

  return await response.json();
}
