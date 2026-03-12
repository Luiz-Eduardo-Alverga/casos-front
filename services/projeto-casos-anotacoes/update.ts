import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";
import type { AnotacaoItem } from "./create";

export interface UpdateAnotacaoRequest {
  anotacoes: string;
}

export interface UpdateAnotacaoResponse {
  message: string;
  data: AnotacaoItem;
}

/**
 * Atualiza uma anotação pelo ID (sequência).
 * PUT /api/projeto-casos-anotacoes/{id} → API externa PUT /projeto-casos-anotacoes/{id}
 */
export async function updateAnotacao(
  id: number | string,
  data: UpdateAnotacaoRequest
): Promise<UpdateAnotacaoResponse> {
  const token = getToken();

  const url = new URL(
    `/api/projeto-casos-anotacoes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao atualizar anotação"
    );
  }

  return await response.json();
}
