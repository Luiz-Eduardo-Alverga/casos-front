import { fetchWithAuth } from "@/lib/fetch";
import type {
  AddLiberacaoVersoesRequest,
  AddLiberacaoVersoesResponse,
} from "@/interfaces/liberacao";

export type { AddLiberacaoVersoesRequest, AddLiberacaoVersoesResponse };

/**
 * Adiciona versões a um registro de liberação.
 * Fluxo: Service → API Route → API externa POST /sprint/liberacoes/{registro}/versoes
 */
export async function addLiberacaoVersoes(
  registro: number | string,
  data: AddLiberacaoVersoesRequest,
): Promise<AddLiberacaoVersoesResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/versoes`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao adicionar versões à liberação",
    );
  }

  return await response.json();
}
