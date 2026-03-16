import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

/** Payload de sucesso da API ao iniciar produção */
export interface IniciarProducaoData {
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

export interface IniciarProducaoResponse {
  success: true;
  message: string;
  data: IniciarProducaoData;
}

/** Estrutura de erro retornada pela API (400 ou 422) */
export interface IniciarProducaoErrorPayload {
  success: false;
  message: string;
  caso_aberto: number | null;
}

/**
 * Erro lançado quando a API retorna 400 ou 422 ao iniciar produção.
 * Permite à aplicação identificar o tipo de erro e tomar ações (ex.: redirecionar para caso aberto).
 */
export class IniciarProducaoError extends Error {
  readonly status: 400 | 422;
  readonly caso_aberto: number | null;
  readonly code: "CASO_JA_ABERTO" | "TEMPO_ESTIMADO_OBRIGATORIO";

  constructor(payload: IniciarProducaoErrorPayload, status: 400 | 422) {
    super(payload.message);
    this.name = "IniciarProducaoError";
    this.status = status;
    this.caso_aberto = payload.caso_aberto;
    this.code =
      status === 400 ? "CASO_JA_ABERTO" : "TEMPO_ESTIMADO_OBRIGATORIO";
  }
}

/**
 * Inicia a produção de um caso.
 * POST /api/projeto-casos-producao/iniciar/{registro} → API externa
 *
 * @throws {IniciarProducaoError} Em 400 (caso já aberto) ou 422 (tempo estimado obrigatório)
 * @throws {Error} Em outros erros de rede ou servidor
 */
export async function iniciarProducao(
  registro: number | string
): Promise<IniciarProducaoResponse> {
  const token = getToken();
  const id = encodeURIComponent(String(registro));

  const url = new URL(
    `/api/projeto-casos-producao/iniciar/${id}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 400 || response.status === 422) {
      const payload: IniciarProducaoErrorPayload = {
        success: false,
        message:
          body?.message ?? "Erro ao iniciar produção",
        caso_aberto: body?.caso_aberto ?? null,
      };
      throw new IniciarProducaoError(payload, response.status as 400 | 422);
    }
    throw new Error(
      body?.error ?? body?.message ?? "Erro ao iniciar produção"
    );
  }

  return body as IniciarProducaoResponse;
}
