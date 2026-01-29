import { getToken } from "@/lib/auth";

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
}): Promise<Versao[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/versoes", window.location.origin);
  url.searchParams.set("produto_id", params.produto_id);
  if (params.search) url.searchParams.set("search", params.search);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar versões");
  }

  return await response.json();
}

