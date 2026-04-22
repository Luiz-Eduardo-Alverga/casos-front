import { fetchWithAuth } from "@/lib/fetch";

export interface DeleteCasoRelacaoResponse {
  message: string;
}

/**
 * Exclui uma relação de caso pelo ID (sequência).
 * DELETE /api/projeto-casos-relacoes/{id} → API externa DELETE /projeto-casos-relacoes/{id}
 */
export async function deleteCasoRelacao(
  id: number | string
): Promise<DeleteCasoRelacaoResponse> {
  const url = new URL(
    `/api/projeto-casos-relacoes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao excluir relação do caso"
    );
  }

  return await response.json();
}

