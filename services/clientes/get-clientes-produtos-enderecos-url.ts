import { fetchWithAuth } from "@/lib/fetch";

export interface ClienteProdutoEnderecoUrl {
  seq: number;
  registro: number;
  produto_id: number;
  produto_nome: string;
  url: string;
  usuario: string | null;
  senha: string | null;
  observacao: string | null;
  alteracao_usuario: string | null;
  alteracao_datahora: string | null;
}

export interface GetClientesProdutosEnderecosUrlResponse {
  data: ClienteProdutoEnderecoUrl[];
  total: number;
}

/**
 * URLs de produtos vinculadas ao registro do cliente/caso.
 * GET /api/clientes/produtos-enderecos-url?registro= → API externa GET /clientes-produtos-enderecos-url
 */
export async function getClientesProdutosEnderecosUrl(params: {
  registro: number | string;
}): Promise<GetClientesProdutosEnderecosUrlResponse> {
  const url = new URL(
    "/api/clientes/produtos-enderecos-url",
    window.location.origin,
  );
  url.searchParams.set("registro", String(params.registro));

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error ||
        error?.message ||
        "Erro ao buscar endereços URL dos produtos do cliente",
    );
  }

  return await response.json();
}
