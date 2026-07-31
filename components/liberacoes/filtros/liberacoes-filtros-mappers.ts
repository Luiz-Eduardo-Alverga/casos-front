import type { GetLiberacoesParams } from "@/interfaces/liberacao";
import type { LiberacoesFiltrosState } from "@/components/liberacoes/filtros/liberacoes-filtros.types";

export function hasFiltersApplied(filtros: LiberacoesFiltrosState): boolean {
  return Boolean(
    filtros.produtoId?.trim() ||
      filtros.status?.trim() ||
      filtros.tipoLiberacao?.trim() ||
      filtros.versao?.trim(),
  );
}

export function filtrosToLiberacoesParams(
  filtros: LiberacoesFiltrosState,
): Omit<GetLiberacoesParams, "cursor" | "per_page"> {
  const params: Omit<GetLiberacoesParams, "cursor" | "per_page"> = {};
  if (filtros.produtoId?.trim()) params.produto_id = filtros.produtoId.trim();
  if (filtros.status?.trim()) params.status = filtros.status.trim();
  if (filtros.tipoLiberacao?.trim())
    params.tipo_liberacao = filtros.tipoLiberacao.trim();
  if (filtros.versao?.trim()) params.versao = filtros.versao.trim();
  return params;
}
