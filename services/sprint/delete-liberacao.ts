import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteLiberacaoResponse } from "@/interfaces/liberacao";

export type { DeleteLiberacaoResponse };

const DEFAULT_SUCCESS: DeleteLiberacaoResponse = {
  success: true,
  message: "Liberação excluída com sucesso.",
};

/**
 * Exclui um registro de liberação.
 * Fluxo: Service → API Route → API externa DELETE /sprint/liberacoes/{registro}
 */
export async function deleteLiberacao(
  registro: number | string,
): Promise<DeleteLiberacaoResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir liberação",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteLiberacaoResponse;
}
