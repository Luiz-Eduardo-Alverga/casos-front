import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteLiberacaoChecklistItemResponse } from "@/interfaces/liberacao";

export type { DeleteLiberacaoChecklistItemResponse } from "@/interfaces/liberacao";

const DEFAULT_SUCCESS: DeleteLiberacaoChecklistItemResponse = {
  success: true,
  message: "Item do checklist excluído com sucesso.",
};

/**
 * Remove um item do checklist de um registro de liberação.
 * Fluxo: Service → API Route → API externa DELETE /sprint/liberacoes/{registro}/checklist/{itemId}
 */
export async function deleteLiberacaoChecklistItem(
  registro: number | string,
  itemId: number | string,
): Promise<DeleteLiberacaoChecklistItemResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/checklist/${encodeURIComponent(String(itemId))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao excluir item do checklist",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteLiberacaoChecklistItemResponse;
}
