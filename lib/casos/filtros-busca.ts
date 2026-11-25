/**
 * Filtros de busca de casos já resolvidos (ids e textos que o legado entende) e o mapeamento
 * para os parâmetros do `GET /projeto-memoria`. Mesmos nomes de parâmetro que a tela de Casos
 * envia (`filtrosToProjetoMemoriaParams` em `components/casos/filtros/casos-filtros-mappers.ts`),
 * sem depender de catálogos carregados no navegador. Funções puras.
 */
export interface FiltrosBuscaCasos {
  /** Parte do resumo: o legado busca "contém", sem diferença de maiúsculas e acentos. */
  texto?: string;
  produto_id?: string;
  /** Texto da versão (ex.: "3.07.01"), não a sequência do catálogo. */
  versao_produto?: string;
  status_ids?: string[];
  modulo?: string;
  projeto_id?: string;
  /** Nome do setor, como a tela envia. */
  setor?: string;
  tipo_abertura?: "CASO" | "REPORT";
  usuario_dev_id?: string;
  usuario_qa_id?: string;
  usuario_abertura_id?: string;
  /** AAAA-MM-DD */
  data_abertura_inicio?: string;
  data_abertura_final?: string;
  data_producao_inicio?: string;
  data_producao_fim?: string;
  nao_planejado?: boolean;
}

export interface OpcoesPaginaProjetoMemoria {
  per_page: number;
  cursor?: string;
  sort_by?: "numero_caso" | "produto_nome" | "prioridade" | "data_conclusao_dev" | "tempo_estimado";
  sort_order?: "ASC" | "DESC";
}

const t = (v: string | undefined) => (v ?? "").trim();

/** Há pelo menos um filtro preenchido (a busca pelo conector exige um; decisão #30). */
export function temFiltroBusca(f: FiltrosBuscaCasos): boolean {
  return (
    (f.status_ids?.length ?? 0) > 0 ||
    f.nao_planejado !== undefined ||
    [
      f.texto,
      f.produto_id,
      f.versao_produto,
      f.modulo,
      f.projeto_id,
      f.setor,
      f.tipo_abertura,
      f.usuario_dev_id,
      f.usuario_qa_id,
      f.usuario_abertura_id,
      f.data_abertura_inicio,
      f.data_abertura_final,
      f.data_producao_inicio,
      f.data_producao_fim,
    ].some((v) => t(v) !== "")
  );
}

/** Parâmetros do `GET /projeto-memoria` (status em lista repete `status_id`). */
export function parametrosProjetoMemoria(
  f: FiltrosBuscaCasos,
  pagina: OpcoesPaginaProjetoMemoria,
): Record<string, string | string[]> {
  const p: Record<string, string | string[]> = { per_page: String(pagina.per_page) };
  const set = (chave: string, valor: string | undefined) => {
    if (t(valor)) p[chave] = t(valor);
  };
  set("cursor", pagina.cursor);
  set("sort_by", pagina.sort_by);
  set("sort_order", pagina.sort_order);
  set("descricao_resumo", f.texto);
  set("produto_id", f.produto_id);
  set("versao_produto", f.versao_produto);
  set("modulo", f.modulo);
  set("projeto_id", f.projeto_id);
  set("setor", f.setor);
  set("tipo_abertura", f.tipo_abertura);
  set("usuario_dev_id", f.usuario_dev_id);
  set("usuario_qa_id", f.usuario_qa_id);
  set("usuario_abertura_id", f.usuario_abertura_id);
  set("data_abertura_inicio", f.data_abertura_inicio);
  set("data_abertura_final", f.data_abertura_final);
  set("data_producao_inicio", f.data_producao_inicio);
  set("data_producao_fim", f.data_producao_fim);
  const status = (f.status_ids ?? []).map((s) => s.trim()).filter(Boolean);
  if (status.length) p.status_id = status;
  if (f.nao_planejado !== undefined) p.nao_planejado = f.nao_planejado ? "1" : "0";
  return p;
}
