import { fetchWithAuth } from "@/lib/fetch";

export interface BulkUpdateCasosRequest {
  ids: Array<number | string>;
  AtribuidoPara?: number;
  atribuido_qa?: number;
  Prioridade?: number;
  cronograma_id?: number;
  VersaoProduto?: string;
}

export interface BulkUpdateCasosResponse {
  success: boolean;
  message: string;
  updated: number;
  not_found: Array<number | string>;
}

/**
 * Atualiza múltiplos casos de uma vez.
 * POST /api/projeto-casos/bulk-update → API externa POST /projeto-casos/bulk-update
 */
export async function bulkUpdateCasos(
  body: BulkUpdateCasosRequest,
): Promise<BulkUpdateCasosResponse> {
  const url = new URL("/api/projeto-casos/bulk-update", window.location.origin);

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao atualizar casos em lote",
    );
  }

  return await response.json();
}
