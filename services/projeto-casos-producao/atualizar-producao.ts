import { fetchWithAuth } from "@/lib/fetch";

/** Payload enviado na atualização de produção */
export interface AtualizarProducaoPayload {
  tipo_producao?: string;
  hora_abertura?: string;
  hora_fechamento?: string;
}

/** Dados retornados pela API ao atualizar produção */
export interface AtualizarProducaoData {
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
  valeu_usuario_id: number;
  duracao_minutos: number;
  status: string;
  em_andamento: boolean;
  finalizado: boolean;
  projeto_caso: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export interface AtualizarProducaoResponse {
  message: string;
  data: AtualizarProducaoData;
}

/**
 * Atualiza uma produção existente (tipo_producao, hora_fechamento, etc.).
 * PUT /api/projeto-casos-producao/{sequencia} → API externa
 */
export async function atualizarProducao(
  sequencia: number | string,
  payload: AtualizarProducaoPayload
): Promise<AtualizarProducaoResponse> {
  const id = encodeURIComponent(String(sequencia));

  const url = new URL(
    `/api/projeto-casos-producao/${id}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.error ?? body?.message ?? "Erro ao atualizar produção"
    );
  }

  return body as AtualizarProducaoResponse;
}
