import { fetchWithAuth } from "@/lib/fetch";
import { HttpError } from "@/lib/http-error";
import type {
  CreateTicketRequest,
  TicketDetalhe,
} from "@/interfaces/cliente-ticket";

/**
 * Cria um ticket na API Softcom Cloud.
 * Fluxo: Service → API Route → Softcom Cloud (x-api-key no servidor).
 */
export async function createTicket(
  data: CreateTicketRequest,
): Promise<TicketDetalhe> {
  const response = await fetchWithAuth("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao criar ocorrência";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
