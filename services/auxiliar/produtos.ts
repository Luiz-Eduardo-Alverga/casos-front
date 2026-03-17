import { fetchWithAuth } from "@/lib/fetch";

export interface Produto {
  id: number;
  nome_projeto: string;
  setor: string;
}

export async function getProdutos(params?: { search?: string }): Promise<Produto[]> {
  const url = new URL("/api/auxiliar/produtos", window.location.origin);
  if (params?.search) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar produtos");
  }

  return await response.json();
}

