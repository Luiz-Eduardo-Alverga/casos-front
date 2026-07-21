import type {
  AnotacaoCasoItem,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import type { CreateTicketRequest } from "@/interfaces/cliente-ticket";

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
  const lista = Array.isArray(clientes) ? clientes : [];
  const ids = lista
    .map((c) => Number(c.cliente))
    .filter((id) => Number.isFinite(id) && id > 0);
  return [...new Set(ids)];
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
