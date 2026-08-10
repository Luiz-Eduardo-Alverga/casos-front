import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateLiberacaoChecklistItemRequest,
  UpdateLiberacaoChecklistItemResponse,
} from "@/interfaces/liberacao";

export type {
  UpdateLiberacaoChecklistItemRequest,
  UpdateLiberacaoChecklistItemResponse,
} from "@/interfaces/liberacao";

/**
 * Atualiza um item do checklist (ex.: marcar como checado e observação).
 * Fluxo: Service → API Route → API externa PUT /sprint/liberacoes/{registro}/checklist/{itemId}
 */
export async function updateLiberacaoChecklistItem(
  registro: number | string,
  itemId: number | string,
  data: UpdateLiberacaoChecklistItemRequest,
): Promise<UpdateLiberacaoChecklistItemResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/checklist/${encodeURIComponent(String(itemId))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao atualizar item do checklist",
    );
  }

  return (await response.json()) as UpdateLiberacaoChecklistItemResponse;
}
