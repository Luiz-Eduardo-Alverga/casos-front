import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface ProdutoOrdem {
  id: string;
  id_colaborador: string;
  id_produto: string;
  produto_nome: string;
  versao: string;
  ordem: string;
  selecionado: boolean;
}

export interface ProdutosOrdemResponse {
  data: ProdutoOrdem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function getProdutosOrdem(params: {
  id_colaborador: string;
}): Promise<ProdutosOrdemResponse> {
  const token = getToken();

  const url = new URL("/api/projeto-dev/produtos-ordem", window.location.origin);
  url.searchParams.set("id_colaborador", params.id_colaborador);

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar produtos ordem");
  }

  return await response.json();
}
