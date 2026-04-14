import { fetchWithAuth } from "@/lib/fetch";

export interface Versao {
  id: string;
  versao: string;
  abertura: string;
  fechamento: string;
  sequencia: string;
  testador_id: number;
}

export async function getVersoes(params: {
  produto_id: string;
  search?: string;
  todas?: boolean;
}): Promise<Versao[]> {
  const url = new URL("/api/auxiliar/versoes", window.location.origin);
  url.searchParams.set("produto_id", params.produto_id);
  if (params.search) url.searchParams.set("search", params.search);
  url.searchParams.set("todas", String(params.todas ?? false));

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar versões");
  }

  return await response.json();
}

