import { fetchWithAuth } from "@/lib/fetch";

/**
 * Payload para atualização parcial de um caso (PATCH).
 * Todos os campos são opcionais; a API aceita apenas os enviados.
 * Nomes em PascalCase conforme contrato da API externa.
 */
export interface UpdateCasoRequest {
  Datas?: string;
  Projeto?: number;
  AtribuidoPara?: number;
  Relator?: number;
  Categoria?: number;
  Prioridade?: number;
  Gravidade?: number;
  Frequencia?: number;
  VersaoProduto?: string;
  CorrigidoNaVersao?: string | null;
  DescricaoResumo?: string;
  DescricaoCompleta?: string;
  PassosParaReproduzir?: string | null;
  InformacoesAdicionais?: string | null;
  Anexo?: string | null;
  Estado?: number;
  Resolucao?: number;
  status?: number;
  TempoEstimado?: string | null;
  TempoStatus?: string;
  DataConclusao?: string | null;
  Historia?: number | null;
  tamanho?: number | null;
  Cronograma_id?: number;
  Selecionar?: number | boolean;
  NaoPlanejado?: number | boolean;
  Modulo?: string;
  FechadoCommit?: number;
  Viabilidade?: boolean;
  Viabilidade_Entendido?: boolean;
  Viabilidade_Realizavel?: boolean;
  Viabilidade_Completo?: boolean;
  Id_Melhorias?: number | null;
  Id_RFC?: number | null;
  Id_CasoPai?: number | null;
  Bloqueado?: boolean;
  DescricaoCommit?: string | null;
  Liberacao?: boolean;
  Lacrar?: boolean;
  PrazoConclusao?: string | null;
  ReducaoChamados?: boolean;
  Id_Origem?: number;
  DevCasos_ID?: number | null;
  Faq_ID?: number | null;
  Reuso_ID?: number | null;
  FAQ_TempoMedioCaso?: number | null;
  ValeuCaso?: number | null;
  Teste_FaqID?: number | null;
  Teste_Valeu?: number | null;
  atualizador?: number | null;
  Id_Usuario_AberturaCaso?: number;
  entregue?: boolean;
  atualizacao_automatica?: boolean;
  sinc?: boolean;
  atribuido_qa?: number;
}

export interface UpdateCasoResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Atualiza um caso existente pelo ID (PATCH parcial).
 * PATCH /api/projeto-casos/{id} → API externa PATCH /projeto-casos/{id}
 */
export async function updateCaso(
  id: number | string,
  data: UpdateCasoRequest
): Promise<UpdateCasoResponse> {
  const url = new URL(
    `/api/projeto-casos/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao atualizar caso"
    );
  }

  return await response.json();
}
