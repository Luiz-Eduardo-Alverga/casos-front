import { fetchWithAuth } from "@/lib/fetch";
import type { GetClientesResponse } from "@/interfaces/cliente";

export type GetSoftcomClientesParams = {
  nome?: string;
  page?: number;
  pageSize?: number;
};

/**
 * Lista clientes na API Softcom Cloud.
 * Fluxo: Service → API Route → Softcom Cloud (x-api-key no servidor).
 */
export async function getSoftcomClientes(
  params: GetSoftcomClientesParams = {},
): Promise<GetClientesResponse> {
  const url = new URL("/api/clientes", window.location.origin);

  if (params.nome) url.searchParams.set("nome", params.nome);
  if (params.page != null) url.searchParams.set("page", String(params.page));
  if (params.pageSize != null) {
    url.searchParams.set("pageSize", String(params.pageSize));
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar clientes");
  }

  return await response.json();
}
