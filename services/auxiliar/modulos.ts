import { fetchWithAuth } from "@/lib/fetch";

export async function getModulos(params: {
  produto_id: string;
  search?: string;
}): Promise<string[]> {
  const url = new URL("/api/auxiliar/modulos", window.location.origin);
  url.searchParams.set("produto_id", params.produto_id);
  if (params.search) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar módulos");
  }

  return await response.json();
}
