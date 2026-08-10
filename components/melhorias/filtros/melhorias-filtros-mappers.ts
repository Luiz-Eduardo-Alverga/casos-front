import type { GetPainelIdeiasParams } from "@/services/painel-ideias/get-painel-ideias";
import type { MelhoriasFiltrosState } from "@/components/melhorias/filtros/melhorias-filtros.types";

/** Extrai `YYYY-MM-DD` de ISO ou datetime da API. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? "";
}

/** Converte `YYYY-MM-DD` da URL em `Date` local (sem horário). */
export function parseDateFilterValue(
  value: string | null | undefined,
): Date | undefined {
  const datePart = toDateInputValue(value);
  if (!datePart) return undefined;
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/** Formata `Date` local para `YYYY-MM-DD` (estado da URL). */
export function formatDateFilterValue(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Primeiro dia do mês corrente (`YYYY-MM-DD`). */
export function getPrimeiroDiaMesAtual(reference = new Date()): string {
  return formatDateFilterValue(
    new Date(reference.getFullYear(), reference.getMonth(), 1),
  );
}

/** Último dia do mês corrente (`YYYY-MM-DD`). */
export function getUltimoDiaMesAtual(reference = new Date()): string {
  return formatDateFilterValue(
    new Date(reference.getFullYear(), reference.getMonth() + 1, 0),
  );
}

/**
 * Converte `YYYY-MM-DD` do filtro para ISO na API:
 * data inicial → 00:00:00 / data final → 23:59:59.
 */
function dateInputToIso(
  value: string,
  boundary: "start" | "end",
): string | undefined {
  const datePart = toDateInputValue(value);
  if (!datePart) return undefined;
  return boundary === "start"
    ? `${datePart}T00:00:00.000Z`
    : `${datePart}T23:59:59.000Z`;
}

function parseBooleanFilter(value: string): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function hasFiltersApplied(filtros: MelhoriasFiltrosState): boolean {
  return Boolean(
    filtros.produtoId?.trim() ||
      filtros.setor?.trim() ||
      filtros.search?.trim() ||
      filtros.dataInicial?.trim() ||
      filtros.dataFinal?.trim() ||
      filtros.lacrar?.trim() ||
      filtros.concluido?.trim() ||
      filtros.registro?.trim(),
  );
}

/** Chave estável para sincronizar o formulário com os filtros aplicados na URL. */
export function filtrosQueryKey(filtros: MelhoriasFiltrosState): string {
  return [
    filtros.produtoId,
    filtros.setor,
    filtros.search,
    filtros.dataInicial,
    filtros.dataFinal,
    filtros.lacrar,
    filtros.concluido,
    filtros.registro,
  ].join("|");
}

/** Converte o estado do formulário para o payload do nuqs (null limpa o param). */
export function filtrosToNuqsState(filtros: MelhoriasFiltrosState) {
  return {
    produtoId: filtros.produtoId.trim() || null,
    setor: filtros.setor.trim() || null,
    search: filtros.search.trim() || null,
    dataInicial: filtros.dataInicial.trim() || null,
    dataFinal: filtros.dataFinal.trim() || null,
    lacrar: filtros.lacrar.trim() || null,
    concluido: filtros.concluido.trim() || null,
    registro: filtros.registro.trim() || null,
  };
}

export function filtrosToPainelIdeiasParams(
  filtros: MelhoriasFiltrosState,
): Omit<GetPainelIdeiasParams, "page" | "per_page"> {
  const params: Omit<GetPainelIdeiasParams, "page" | "per_page"> = {};

  if (filtros.produtoId?.trim()) {
    params.produto_id = filtros.produtoId.trim();
  }
  if (filtros.setor?.trim()) {
    params.setor = filtros.setor.trim();
  }
  if (filtros.search?.trim()) {
    params.search = filtros.search.trim();
  }
  if (filtros.registro?.trim()) {
    params.registro = filtros.registro.trim();
  }

  const dataInicial = dateInputToIso(filtros.dataInicial, "start");
  if (dataInicial) params.data_inicial = dataInicial;

  const dataFinal = dateInputToIso(filtros.dataFinal, "end");
  if (dataFinal) params.data_final = dataFinal;

  const lacrar = parseBooleanFilter(filtros.lacrar);
  if (lacrar !== undefined) params.lacrar = lacrar;

  const concluido = parseBooleanFilter(filtros.concluido);
  if (concluido !== undefined) params.concluido = concluido;

  return params;
}
