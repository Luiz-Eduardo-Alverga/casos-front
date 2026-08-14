import type {
  AnotacaoCasoItem,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import type { CreateTicketRequest } from "@/interfaces/cliente-ticket";
import { CASO_STATUS_INCOMPLETO_ID } from "@/components/casos/edicao/report-analise-modal/utils";

/** Retorna a anotação com maior `sequencia` (última informada). */
export function getUltimaAnotacao(
  anotacoes: AnotacaoCasoItem[] | null | undefined,
): AnotacaoCasoItem | null {
  const lista = Array.isArray(anotacoes) ? anotacoes : [];
  if (lista.length === 0) return null;

  return lista.reduce((maisRecente, atual) =>
    atual.sequencia > maisRecente.sequencia ? atual : maisRecente,
  );
}

export function buildMotivoOcorrencia(params: {
  casoId: number;
  descricaoResumo: string | null | undefined;
  ultimaAnotacaoTexto: string | null | undefined;
}): string {
  const resumo = (params.descricaoResumo ?? "").trim();
  const cabecalho = resumo
    ? `Caso ${params.casoId} - ${resumo}`
    : `Caso ${params.casoId}`;
  const anotacao = (params.ultimaAnotacaoTexto ?? "").trim();
  const motivo = !anotacao ? cabecalho : `${cabecalho}\n\n${anotacao}`;
  // Mesmo tratamento de DescricaoCompleta no Softflow (CRLF).
  return motivo.replace(/\r?\n/g, "\r\n");
}

/** Hoje às 15:15 no relógio local, sem converter para UTC (evita +3h no Brasil). */
export function buildHoraMarcada1515(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T15:15:00.000Z`;
}

function formatDateYmd(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildCreateTicketPayload(params: {
  clienteId: number;
  casoId: number;
  descricaoResumo: string | null | undefined;
  ultimaAnotacaoTexto: string | null | undefined;
  atendente: string;
  suporteId: number;
}): CreateTicketRequest {
  const now = new Date();
  return {
    clienteId: params.clienteId,
    motivo: buildMotivoOcorrencia({
      casoId: params.casoId,
      descricaoResumo: params.descricaoResumo,
      ultimaAnotacaoTexto: params.ultimaAnotacaoTexto,
    }),
    horaMarcada: buildHoraMarcada1515(now),
    atendente: params.atendente,
    solicitadoPor: params.atendente,
    suporteId: params.suporteId,
    tipoAtendimento: "CLIENTE",
    assunto: "",
    ticket: 0,
    is: false,
    urgente: false,
    data: formatDateYmd(now),
  };
}

export function getClienteIdsVinculados(
  clientes: ClienteCasoItem[] | null | undefined,
): number[] {
  return getClientesVinculadosUnicos(clientes).map((c) => Number(c.cliente));
}

/** Clientes únicos por `cliente` (primeiro vínculo encontrado). */
export function getClientesVinculadosUnicos(
  clientes: ClienteCasoItem[] | null | undefined,
): ClienteCasoItem[] {
  const lista = Array.isArray(clientes) ? clientes : [];
  const seen = new Set<number>();
  const unicos: ClienteCasoItem[] = [];
  for (const item of lista) {
    const id = Number(item.cliente);
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    unicos.push(item);
  }
  return unicos;
}

/**
 * Pergunta se deseja abrir ocorrência só na transição para Incompleto (8).
 * Não pergunta de novo se o caso já estava nesse status.
 */
export function devePerguntarAbrirOcorrencia(
  statusAnterior: number | string | null | undefined,
  statusFinal: number | string | null | undefined,
): boolean {
  const final = Number(statusFinal);
  if (!Number.isFinite(final) || final !== CASO_STATUS_INCOMPLETO_ID) {
    return false;
  }
  const anterior = Number(statusAnterior);
  if (Number.isFinite(anterior) && anterior === CASO_STATUS_INCOMPLETO_ID) {
    return false;
  }
  return true;
}

/** Resolve o id do usuário pelo `nome_suporte` (ex.: responsavel_feedback_nome). */
export function findUsuarioIdByNome(
  usuarios: Array<{ id: string; nome_suporte: string }>,
  nome: string | null | undefined,
): number | null {
  const target = (nome ?? "").trim().toLowerCase();
  if (!target) return null;

  const found = usuarios.find(
    (u) => (u.nome_suporte ?? "").trim().toLowerCase() === target,
  );
  if (!found) return null;

  const id = Number(found.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}
