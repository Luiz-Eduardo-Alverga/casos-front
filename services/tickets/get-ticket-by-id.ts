import { fetchWithAuth } from "@/lib/fetch";
import { HttpError } from "@/lib/http-error";
import type { TicketDetalhe } from "@/interfaces/cliente-ticket";

/**
 * Busca o detalhamento de um ticket na API Softcom Cloud.
 * Fluxo: Service → API Route → Softcom Cloud (x-api-key no servidor).
 */
export async function getTicketById(
  id: number | string,
): Promise<TicketDetalhe> {
  const url = new URL(
    `/api/tickets/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao buscar detalhes da ocorrência";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
