import { fetchWithAuth } from "@/lib/fetch";

/** Payload de sucesso da API ao parar produção */
export interface PararProducaoData {
  sequencia: number;
  registro: number;
  data_producao: string;
  data_producao_formatada: string;
  hora_abertura: string;
  hora_abertura_formatada: string;
  hora_fechamento: string | null;
  hora_fechamento_formatada: string | null;
  tipo_producao: string;
  usuario: number;
  cronograma_id: number;
  valeu_usuario_id: number | null;
  duracao_minutos: number | null;
  status: string;
  em_andamento: boolean;
  finalizado: boolean;
  projeto_caso: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export interface PararProducaoResponse {
  success: true;
  message: string;
  data: PararProducaoData;
}

/**
 * Para a produção de um caso.
 * POST /api/projeto-casos-producao/parar/{registro} → API externa
 */
export async function pararProducao(
  registro: number | string
): Promise<PararProducaoResponse> {
  const id = encodeURIComponent(String(registro));

  const url = new URL(
    `/api/projeto-casos-producao/parar/${id}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.error ?? body?.message ?? "Erro ao parar produção"
    );
  }

  return body as PararProducaoResponse;
}
