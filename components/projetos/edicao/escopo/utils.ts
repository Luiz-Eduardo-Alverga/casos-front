import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { ProjetoMemoriaQueryParams } from "@/hooks/casos/use-projeto-memoria";
import type { ProjetosTabelaEscopoRow } from "@/components/projetos/tabela/projetos-tabela-types";

const DUPLICADO_RELACAO_NOME = "É DUPLICADO DE";

export type EscopoNaoPlanejadoFiltro = "todos" | "planejado" | "nao_planejado";

export const ESCOPO_NAO_PLANEJADO_OPTIONS = [
  { value: "todos" as const, label: "Todos" },
  { value: "planejado" as const, label: "Planejado" },
  { value: "nao_planejado" as const, label: "Não planejados" },
] as const;

export function naoPlanejadoFiltroToApiParam(
  filtro: EscopoNaoPlanejadoFiltro,
): boolean | undefined {
  if (filtro === "todos") return undefined;
  if (filtro === "planejado") return false;
  return true;
}

export function isNaoPlanejado(item: ProjetoMemoriaItem): boolean {
  return item.caso.flags?.nao_planejado === true;
}

export function isViavel(item: ProjetoMemoriaItem): boolean {
  const v = item.caso.viabilidade;
  return Boolean(v?.entendido && v?.realizavel && v?.completo);
}

export function isDuplicado(item: ProjetoMemoriaItem): boolean {
  return item.caso.flags.bloqueado === true;
}

export function mapProjetoMemoriaToTabelaRow(
  item: ProjetoMemoriaItem,
): ProjetosTabelaEscopoRow {
  return {
    id: String(item.caso.id),
    numero: String(item.caso.id),
    descricao: item.caso.textos.descricao_resumo ?? "",
    categoria: item.caso.caracteristicas.tipo_categoria ?? "",
    produto: item.produto.nome ?? "",
    versao: item.produto.versao ?? "",
    tipo_abertura: item.report?.tipo_abertura ?? "CASO",
    estimado_minutos: item.caso.tempos.estimado_minutos ?? 0,
    realizado_minutos: item.caso.tempos.realizado_minutos ?? 0,
    desenvolvedor: item.caso.usuarios?.desenvolvimento?.nome?.trim() ?? "",
    status: item.caso.status?.status_tipo ?? item.caso.status?.descricao ?? "",
    showNaoPlanejado: isNaoPlanejado(item),
    showViavel: isViavel(item),
    showDuplicado: isDuplicado(item),
  };
}

export function buildEscopoMemoriaParams(
  projetoId: number | string,
  statusIds: string[],
  usuarioDevId: string,
  naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro = "todos",
  duplicado: "TRUE" | "FALSE" | "TODOS" = "TODOS",
): ProjetoMemoriaQueryParams {
  const naoPlanejado = naoPlanejadoFiltroToApiParam(naoPlanejadoFiltro);

  return {
    per_page: 15,
    projeto_id: String(projetoId),
    duplicado,
    ...(statusIds.length > 0 ? { status_id: statusIds } : {}),
    ...(usuarioDevId.trim() ? { usuario_dev_id: usuarioDevId.trim() } : {}),
    ...(naoPlanejado !== undefined ? { nao_planejado: naoPlanejado } : {}),
  };
}
