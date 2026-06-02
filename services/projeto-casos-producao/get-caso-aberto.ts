import { fetchWithAuth } from "@/lib/fetch";
import type { IniciarProducaoData } from "@/services/projeto-casos-producao/iniciar-producao";

export interface GetCasoAbertoResponse {
  success: true;
  data: IniciarProducaoData;
}

/**
 * Retorna o caso em produção aberto do usuário.
 * GET /api/projeto-casos-producao/caso-aberto/{usuario} → API externa
 */
export async function getCasoAberto(params: {
  usuario: number | string;
}): Promise<GetCasoAbertoResponse> {
  const id = encodeURIComponent(String(params.usuario));

  const url = new URL(
    `/api/projeto-casos-producao/caso-aberto/${id}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.message ?? body?.error ?? "Erro ao buscar caso aberto",
    );
  }

  return body as GetCasoAbertoResponse;
}
