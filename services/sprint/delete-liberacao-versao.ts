import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteLiberacaoVersaoResponse } from "@/interfaces/liberacao";

export type { DeleteLiberacaoVersaoResponse };

const DEFAULT_SUCCESS: DeleteLiberacaoVersaoResponse = {
  success: true,
  message: "Versão excluída com sucesso.",
};

/**
 * Remove uma versão de um registro de liberação.
 * Fluxo: Service → API Route → API externa DELETE /sprint/liberacoes/{registro}/versoes/{sequencia}
 */
export async function deleteLiberacaoVersao(
  registro: number | string,
  sequencia: number | string,
): Promise<DeleteLiberacaoVersaoResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/versoes/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir versão da liberação",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteLiberacaoVersaoResponse;
}
