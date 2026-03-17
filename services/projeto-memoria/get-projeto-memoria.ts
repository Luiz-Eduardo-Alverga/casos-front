import { fetchWithAuth } from "@/lib/fetch";
import type {
  ProjetoMemoriaItemResponse,
  ProjetoMemoriaParams,
  ProjetoMemoriaResponse,
} from "../../interfaces/projeto-memoria";

export type {
  CasoCaracteristicas,
  CasoDatas,
  CasoFlags,
  CasoFlagsAdicionais,
  CasoItem,
  CasoQuantidadesApontadas,
  CasoRelacionamentos,
  CasoStatus,
  CasoTempos,
  CasoTextos,
  CasoUsuarios,
  CasoViabilidade,
  ProjetoMemoriaDatas,
  ProjetoMemoriaItem,
  ProjetoMemoriaItemResponse,
  ProjetoMemoriaPagination,
  ProjetoMemoriaParams,
  ProjetoMemoriaProduto,
  ProjetoMemoriaProjeto,
  ProjetoMemoriaReport,
  ProjetoMemoriaResponse,
  ProjetoMemoriaSetores,
  ProjetoMemoriaTotalizadores,
  UsuarioRef,
} from "../../interfaces/projeto-memoria";

export async function getProjetoMemoria(
  params: ProjetoMemoriaParams = {},
): Promise<ProjetoMemoriaResponse> {
  const url = new URL("/api/projeto-memoria", window.location.origin);

  const stringParams: Array<[string, string | undefined | null]> = [
    ["per_page", params.per_page != null ? String(params.per_page) : undefined],
    ["page", params.page != null ? String(params.page) : undefined],
    ["descricao_resumo", params.descricao_resumo],
    ["usuario_abertura_id", params.usuario_abertura_id],
    ["usuario_dev_id", params.usuario_dev_id],
    ["usuario_qa_id", params.usuario_qa_id],
    ["atribuido_qa", params.atribuido_qa],
    ["prioridade", params.prioridade],
    ["projeto_id", params.projeto_id],
    ["setor", params.setor],
    ["setor_dev", params.setor_dev],
    ["setor_projeto", params.setor_projeto],
    ["produto_id", params.produto_id],
    ["produto_nome", params.produto_nome],
    ["versao_produto", params.versao_produto],
    ["tipo_categoria", params.tipo_categoria],
  ];

  for (const [key, value] of stringParams) {
    if (value != null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  if (params.status_id != null) {
    if (Array.isArray(params.status_id)) {
      params.status_id.forEach((v) => url.searchParams.append("status_id", v));
    } else {
      url.searchParams.set("status_id", params.status_id);
    }
  }

  if (params.cursor != null && params.cursor !== "") {
    url.searchParams.set("cursor", params.cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar projeto memória",
    );
  }

  return await response.json();
}

/**
 * Busca um único item de projeto-memória pelo ID do caso.
 * Segue o padrão: Service → API Route → API externa GET /projeto-memoria/{id}
 */
export async function getProjetoMemoriaById(
  id: number | string,
): Promise<ProjetoMemoriaItemResponse> {
  const url = new URL(
    `/api/projeto-memoria/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao buscar detalhes do projeto memória",
    );
  }

  return await response.json();
}
