import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { ProjetosTabelaEscopoRow } from "@/components/projetos/tabela/projetos-tabela-types";

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
    dias_no_backlog: item.caso.dias_no_backlog ?? 0,
    relacoes: item.caso.relacoes ?? [],
    produto: item.produto.nome ?? "",
    produtoId: String(item.produto.id),
    versao: item.produto.versao ?? "",
    tipo_abertura: item.report?.tipo_abertura ?? "CASO",
    estimado_minutos: item.caso.tempos.estimado_minutos ?? 0,
    realizado_minutos: item.caso.tempos.realizado_minutos ?? 0,
    desenvolvedor: item.caso.usuarios?.desenvolvimento?.nome?.trim() ?? "",
    status: item.caso.status?.status_tipo ?? item.caso.status?.descricao ?? "",
    showNaoPlanejado: isNaoPlanejado(item),
    showViavel: isViavel(item),
    showDuplicado: isDuplicado(item),
    projetoId: String(item.projeto.id),
    dataConclusao: item.caso.datas.conclusao_dev,
  };
}
