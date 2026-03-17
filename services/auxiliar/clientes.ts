import { fetchWithAuth } from "@/lib/fetch";

export interface Cliente {
  registro: string;
  nome: string;
  razao_social: string;
}

export interface ClientesPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

export interface GetClientesResponse {
  success: boolean;
  data: Cliente[];
  pagination: ClientesPagination;
}

export async function getClientes(params: {
  search?: string;
  per_page?: number;
  cursor?: string | null;
}): Promise<GetClientesResponse> {
  const url = new URL("/api/auxiliar/clientes", window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.per_page != null) url.searchParams.set("per_page", String(params.per_page));
  if (params.cursor != null) url.searchParams.set("cursor", params.cursor);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar clientes");
  }

  return await response.json();
}
