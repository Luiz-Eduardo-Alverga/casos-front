import { fetchWithAuth } from "@/lib/fetch";

export interface DeleteClienteCasoResponse {
  message: string;
}

/**
 * Remove o vínculo de um cliente do caso pelo ID (sequência).
 * DELETE /api/projeto-casos-clientes/{id} → API externa DELETE /projeto-casos-clientes/{id}
 */
export async function deleteClienteCaso(
  id: number | string
): Promise<DeleteClienteCasoResponse> {
  const url = new URL(
    `/api/projeto-casos-clientes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao remover cliente do caso"
    );
  }

  return await response.json();
}
