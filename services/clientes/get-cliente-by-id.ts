import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type { ClienteProdutoEnderecoUrl } from "./get-clientes-produtos-enderecos-url";

export interface ClienteDetalhe {
  registro: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  fone_resid: string | null;
  fone_com: string | null;
  email: string | null;
  data_cadastro: string;
  desativado: boolean;
  produtos_enderecos_url: ClienteProdutoEnderecoUrl[];
}

export interface GetClienteByIdResponse {
  success: boolean;
  data: ClienteDetalhe;
}

/**
 * Busca um cliente pelo registro (ID).
 * Fluxo: Service → API Route → API externa GET /clientes/{id}
 */
export async function getClienteById(
  id: number | string,
): Promise<GetClienteByIdResponse> {
  const url = new URL(
    `/api/clientes/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao buscar detalhes do cliente";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
