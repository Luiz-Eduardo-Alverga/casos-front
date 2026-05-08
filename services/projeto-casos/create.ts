import { getUser } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface CreateCasoRequest {
  Projeto: number;
  VersaoProduto: string;
  Prioridade: number;
  Cronograma_id: number;
  Modulo: string;
  Id_Origem: string;
  Categoria: number;
  Relator: number;
  AtribuidoPara: number;
  atribuido_qa: number;
  DescricaoResumo: string;
  DescricaoCompleta: string;
  InformacoesAdicionais?: string;
  status: string;
  Id_Usuario_AberturaCaso: string;
  /** 0 ou 1 — alinhado ao payload da aba Produção / update de caso. */
  NaoPlanejado?: number;

  /** Campos adicionais do payload completo (opcionais). */
  Datas?: string;
  Gravidade?: number | null;
  Frequencia?: number | null;
  CorrigidoNaVersao?: string | null;
  PassosParaReproduzir?: string | null;
  Anexo?: string | null;
  Estado?: number;
  Resolucao?: number;
  TempoEstimado?: number | null;
  TempoStatus?: string;
  DataConclusao?: string | null;
  Historia?: string | null;
  tamanho?: number | null;
  Selecionar?: number;
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
  DevCasos_ID?: number | null;
  Faq_ID?: number | null;
  Reuso_ID?: number | null;
  FAQ_TempoMedioCaso?: number | null;
  ValeuCaso?: number | null;
  Teste_FaqID?: number | null;
  Teste_Valeu?: number | null;
  atualizador?: number;
  entregue?: boolean;
  atualizacao_automatica?: boolean;
  sinc?: boolean;
  data_conclusao_qa?: string | null;
  tipo_abertura?: string;
  stakes_planejamento?: string;
  report_ocorrencia_id?: number | null;
  report_data_hora_incidente?: string | null;
  report_prioridade?: number;
  report_responsavel_suporte_id?: number;
  report_data_escalonamento?: string | null;
  report_data_limite?: string | null;
  report_analise_usuario_id?: number;
  report_analise_data_conclusao?: string | null;
  report_analise_status?: number;
  report_analise_aprovado?: number;
}

export interface CreateCasoResponse {
  success: boolean;
  message: string;
  data: {
    registro: number;
    [key: string]: any;
  };
}

export async function createCaso(
  data: CreateCasoRequest,
): Promise<CreateCasoResponse> {
  const user = getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const response = await fetchWithAuth("/api/projeto-casos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || error?.message || "Erro ao criar caso");
  }

  return await response.json();
}
