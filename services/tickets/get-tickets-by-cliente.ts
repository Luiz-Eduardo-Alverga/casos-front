import { fetchWithAuth } from "@/lib/fetch";
import { HttpError } from "@/lib/http-error";
import type { GetClienteTicketsResponse } from "@/interfaces/cliente-ticket";

export type GetTicketsByClienteParams = {
  registro: number | string;
  page?: number;
  pageSize?: number;
};

/**
 * Lista tickets de um cliente na API Softcom Cloud.
 * Fluxo: Service → API Route → Softcom Cloud (x-api-key no servidor).
 */
export async function getTicketsByCliente(
  params: GetTicketsByClienteParams,
): Promise<GetClienteTicketsResponse> {
  const url = new URL("/api/tickets/cliente/todos", window.location.origin);
  url.searchParams.set("registro", String(params.registro));
  if (params.page != null) {
    url.searchParams.set("page", String(params.page));
  }
  if (params.pageSize != null) {
    url.searchParams.set("pageSize", String(params.pageSize));
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao buscar ocorrências do cliente";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
