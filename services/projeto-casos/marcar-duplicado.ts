import { fetchWithAuth } from "@/lib/fetch";

export interface MarcarCasoDuplicadoRequest {
  caso_relacionado: number;
}

export interface MarcarCasoDuplicadoReport {
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

export interface MarcarCasoDuplicadoCaso {
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
  tipo_abertura: string | null;
  stakes_planejamento: string | null;
  tipo_registro: string | null;
  projeto_tipo_nao_planejado_id: number | null;
  report: MarcarCasoDuplicadoReport;
}

export interface MarcarCasoDuplicadoClientesAdicionados {
  no_registro: number;
  no_caso_relacionado: number;
}

export interface MarcarCasoDuplicadoResponse {
  success: boolean;
  message: string;
  clientes_adicionados: MarcarCasoDuplicadoClientesAdicionados;
  data: MarcarCasoDuplicadoCaso;
  data_relacionado: MarcarCasoDuplicadoCaso;
}

/**
 * Marca um caso como duplicado de outro.
 * POST /api/projeto-casos/{id}/marcar-duplicado
 * → API externa POST /projeto-casos/{id}/marcar-duplicado
 */
export async function marcarCasoDuplicado(
  id: number | string,
  body: MarcarCasoDuplicadoRequest,
): Promise<MarcarCasoDuplicadoResponse> {
  const url = new URL(
    `/api/projeto-casos/${encodeURIComponent(String(id))}/marcar-duplicado`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao marcar caso como duplicado",
    );
  }

  return await response.json();
}
