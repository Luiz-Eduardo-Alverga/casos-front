import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import type { SgpTipoMeta } from "@/components/projetos/edicao/shared/sgp-tipos-utils";
import { resolveTipoLabel } from "@/components/projetos/edicao/shared/sgp-tipos-utils";
import { formatSgpDateTimeToPt } from "@/components/projetos/utils";
import { formatSgpHorasCurto } from "@/components/projetos/edicao/stakes/utils";

export type CronogramaTarefaStatus = "concluido" | "em_andamento" | "pendente";

function parseSgpDatePart(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const datePart = value.trim().split(/\s+/)[0] ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null;
}

function getTodayIsoInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseOrdemFromTitulo(texto: string): number | null {
  const match = texto.trim().match(/^(\d+)\s*-\s*/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function resolveCronogramaOrdemNumero(
  idTipo: number,
  tiposMetaMap: Map<number, SgpTipoMeta>,
): number {
  const meta = tiposMetaMap.get(idTipo);
  const ordemCatalogo = Number(meta?.cronogramaOrdem);
  if (Number.isFinite(ordemCatalogo)) return ordemCatalogo;

  const label = meta?.label?.trim() ?? "";
  const ordemNoTitulo = parseOrdemFromTitulo(label);
  if (ordemNoTitulo !== null) return ordemNoTitulo;

  return Number.POSITIVE_INFINITY;
}

export function resolveCronogramaTitulo(
  idTipo: number,
  tiposMetaMap: Map<number, SgpTipoMeta>,
): string {
  const meta = tiposMetaMap.get(idTipo);
  const label = meta?.label?.trim() || `Tipo ${idTipo}`;
  const ordem = meta?.cronogramaOrdem?.trim();
  if (ordem) {
    if (/^\d+\s*-\s*/.test(label)) return label;
    return `${ordem} - ${label}`;
  }
  return label;
}

export function resolvePapelLabel(
  idPapel: number,
  tiposMap: Map<number, string>,
): string {
  return resolveTipoLabel(idPapel, tiposMap);
}

export function formatCronogramaPeriodo(
  dataInicio: string | null | undefined,
  dataTermino: string | null | undefined,
): string {
  const inicio = formatSgpDateTimeToPt(dataInicio);
  const termino = formatSgpDateTimeToPt(dataTermino);
  if (inicio === "—" && termino === "—") return "—";
  if (inicio === "—") return termino;
  if (termino === "—") return inicio;
  return `${inicio} - ${termino}`;
}

export function resolveCronogramaStatus(
  item: SgpCronogramaItem,
): CronogramaTarefaStatus {
  if (item.concluido) return "concluido";

  const hoje = getTodayIsoInSaoPaulo();
  const inicio = parseSgpDatePart(item.data_inicio);
  const termino = parseSgpDatePart(item.data_termino);

  if (inicio && termino && hoje >= inicio && hoje <= termino) {
    return "em_andamento";
  }

  return "pendente";
}

export function formatCronogramaHoraPrevista(
  value: string | null | undefined,
): string {
  return formatSgpHorasCurto(value);
}
