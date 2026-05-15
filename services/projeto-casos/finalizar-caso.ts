import { fetchWithAuth } from "@/lib/fetch";

export interface FinalizarCasoReport {
  ocorrencia_id: number | null;
  data_hora_incidente: string | null;
  prioridade: number | null;
  responsavel_suporte_id: number;
  data_escalonamento: string | null;
  data_limite: string | null;
  analise_usuario_id: number;
  analise_data_conclusao: string | null;
  analise_status: number;
  analise_aprovado: number;
}

export interface FinalizarCasoData {
  registro: number;
  datas: string | null;
  projeto: number;
  atribuido_para: number;
  relator: number;
  categoria: number;
  prioridade: number;
  gravidade: number;
  frequencia: number;
  versao_produto: string;
  corrigido_na_versao: string | null;
  descricao_resumo: string;
  descricao_completa: string | null;
  passos_para_reproduzir: string | null;
  informacoes_adicionais: string | null;
  anexo: string | null;
  estado: number;
  resolucao: number;
  status: number;
  tempo_estimado: number | null;
  tempo_status: string;
  data_conclusao: string | null;
  data_conclusao_qa: string | null;
  historia: string | null;
  tamanho: number | null;
  cronograma_id: number;
  selecionar: boolean;
  nao_planejado: boolean;
  modulo: string | null;
  fechado_commit: number;
  viabilidade: boolean;
  viabilidade_entendido: boolean;
  viabilidade_realizavel: boolean;
  viabilidade_completo: boolean;
  id_melhorias: number | null;
  id_rfc: number | null;
  id_caso_pai: number | null;
  bloqueado: boolean;
  descricao_commit: string | null;
  liberacao: boolean;
  lacrar: boolean;
  prazo_conclusao: string | null;
  reducao_chamados: boolean;
  id_origem: number;
  dev_casos_id: number | null;
  faq_id: number | null;
  reuso_id: number | null;
  faq_tempo_medio_caso: number | null;
  valeu_caso: number | null;
  teste_faq_id: number | null;
  teste_valeu: number | null;
  atualizador: number | null;
  id_usuario_abertura_caso: number;
  entregue: boolean;
  atualizacao_automatica: boolean;
  sinc: boolean;
  atribuido_qa: number;
  tipo_abertura: string;
  stakes_planejamento: string;
  report: FinalizarCasoReport;
}

export interface FinalizarCasoResponse {
  success: boolean;
  message: string;
  data: FinalizarCasoData;
}

/**
 * Finaliza um caso pelo registro.
 * POST /api/projeto-casos/finalizar-caso/{registro} → API externa POST /projeto-casos/finalizar-caso/{registro}
 */
export async function finalizarCaso(
  registro: number | string,
): Promise<FinalizarCasoResponse> {
  const url = new URL(
    `/api/projeto-casos/finalizar-caso/${encodeURIComponent(String(registro))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao finalizar caso",
    );
  }

  return await response.json();
}
