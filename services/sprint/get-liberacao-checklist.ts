import { fetchWithAuth } from "@/lib/fetch";
import { readApiErrorMessage } from "@/lib/read-api-error-message";
import type { LiberacaoChecklistResponse } from "@/interfaces/liberacao";

export type {
  LiberacaoChecklistItem,
  LiberacaoChecklistResponse,
} from "@/interfaces/liberacao";

/**
 * Lista os itens de checklist de um registro de liberação.
 * Fluxo: Service → API Route → API externa GET /sprint/liberacoes/{registro}/checklist
 */
export async function getLiberacaoChecklist(
  registro: number | string,
): Promise<LiberacaoChecklistResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/checklist`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      readApiErrorMessage(error, "Erro ao buscar checklist da liberação"),
    );
  }

  return (await response.json()) as LiberacaoChecklistResponse;
}
