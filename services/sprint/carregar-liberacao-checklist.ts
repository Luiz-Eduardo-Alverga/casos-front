import { fetchWithAuth } from "@/lib/fetch";
import type { CarregarLiberacaoChecklistResponse } from "@/interfaces/liberacao";

export type { CarregarLiberacaoChecklistResponse } from "@/interfaces/liberacao";

/**
 * Carrega (gera/popula) os itens de checklist a partir do template para um registro de liberação.
 * Fluxo: Service → API Route → API externa POST /sprint/liberacoes/{registro}/checklist/carregar
 */
export async function carregarLiberacaoChecklist(
  registro: number | string,
): Promise<CarregarLiberacaoChecklistResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/checklist/carregar`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao carregar checklist da liberação",
    );
  }

  return (await response.json()) as CarregarLiberacaoChecklistResponse;
}
