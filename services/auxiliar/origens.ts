import { fetchWithAuth } from "@/lib/fetch";

export interface Origem {
  id: string;
  nome: string;
}

export async function getOrigens(params?: {
  search?: string;
}): Promise<Origem[]> {
  const url = new URL("/api/auxiliar/origens", window.location.origin);
  if (params?.search) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar origens");
  }

  return await response.json();
}
