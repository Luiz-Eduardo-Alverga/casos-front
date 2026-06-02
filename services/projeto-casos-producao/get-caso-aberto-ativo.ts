import { fetchWithAuth } from "@/lib/fetch";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { IniciarProducaoData } from "@/services/projeto-casos-producao/iniciar-producao";

export interface CasoAbertoAtivoResponse {
  hasCasoAberto: boolean;
  producao?: IniciarProducaoData;
  caso?: ProjetoMemoriaItem | null;
}

/**
 * Caso em produção aberto do usuário logado + detalhes do caso (projeto-memória).
 * GET /api/projeto-casos-producao/caso-aberto-ativo → API externa (agregado no servidor)
 */
export async function getCasoAbertoAtivo(): Promise<CasoAbertoAtivoResponse> {
  const url = new URL(
    "/api/projeto-casos-producao/caso-aberto-ativo",
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.message ?? body?.error ?? "Erro ao buscar caso aberto ativo",
    );
  }

  return body as CasoAbertoAtivoResponse;
}
