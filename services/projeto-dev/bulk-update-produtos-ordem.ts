import { fetchWithAuth } from "@/lib/fetch";

export interface BulkUpdateProdutosOrdemBody {
  id_colaborador: number;
  ids: Array<number | string>;
  start_at: number;
}

export interface BulkUpdateProdutosOrdemResponse {
  success: boolean;
  message: string;
  updated: number;
  not_found: Array<number | string>;
}

export async function bulkUpdateProdutosOrdem(
  body: BulkUpdateProdutosOrdemBody
): Promise<BulkUpdateProdutosOrdemResponse> {
  const url = new URL(
    "/api/projeto-dev/produtos-ordem/bulk-update-ordem",
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao atualizar ordem"
    );
  }

  return await response.json();
}

