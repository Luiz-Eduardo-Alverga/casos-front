import { getToken } from "@/lib/auth";
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
  const token = getToken();

  const url = new URL(
    `/api/projeto-casos-clientes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao remover cliente do caso"
    );
  }

  return await response.json();
}
