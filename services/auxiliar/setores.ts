import { fetchWithAuth } from "@/lib/fetch";

export interface Setor {
  id: number;
  nome: string;
}

export async function getSetores(params?: {
  search?: string;
}): Promise<Setor[]> {
  const url = new URL("/api/auxiliar/setores", window.location.origin);
  if (params?.search !== undefined) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar setores");
  }

  return await response.json();
}
