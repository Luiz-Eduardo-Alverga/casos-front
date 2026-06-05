import type { Categoria } from "@/services/auxiliar/categorias";
import type { Versao } from "@/services/auxiliar/versoes";
import {
  isSequenciaNoCatalogo,
  resolveVersaoProdutoForApi,
  resolveVersaoSequenciaForForm,
} from "@/components/casos/shared/versao-combobox";
import type { ProjetoMemoriaQueryParams } from "@/hooks/casos/use-projeto-memoria";
import { MAX_STATUS_IDS_FILTRO_CASOS } from "@/components/casos/filtros/constants";
import type {
  CasosFiltrosNuqsState,
  CasosFiltrosNuqsUpdate,
} from "@/components/casos/filtros/casos-filtros-parsers";
import {
  type CasosFiltersForm,
  type CasosFiltrosAplicados,
} from "@/components/casos/filtros/casos-filtros.types";

export function parseYmdToDate(
  value: string | null | undefined,
): Date | undefined {
  if (!value?.trim()) return undefined;
  const s = value.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
}

export function dateToYmd(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function resolveStatusIds(
  params: URLSearchParams,
): string[] {
  let status_ids = params
    .getAll("status_id")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_STATUS_IDS_FILTRO_CASOS);
  const legacyStatus = params.get("status")?.trim();
  if (status_ids.length === 0 && legacyStatus) {
    status_ids = [legacyStatus];
  }
  return status_ids;
}

export function parseSearchParamsToFiltros(
  params: URLSearchParams,
): CasosFiltrosAplicados {
  return {
    produto: params.get("produto") || "",
    versao: params.get("versao") || "",
    modulo: params.get("modulo") || "",
    tipo_categoria: params.get("tipo_categoria") || "",
    tipo_abertura: params.get("tipo_abertura") || "",
    descricao_resumo: params.get("descricao_resumo") || "",
    status_ids: resolveStatusIds(params),
    projeto_id: params.get("projeto_id") || "",
    usuario_abertura_id: params.get("usuario_abertura_id") || "",
    usuario_dev_id: params.get("usuario_dev_id") || "",
    usuario_qa_id: params.get("usuario_qa_id") || "",
    data_producao_inicio: params.get("data_producao_inicio") || "",
    data_producao_fim: params.get("data_producao_fim") || "",
  };
}

export function nuqsStateToFiltrosAplicados(
  state: CasosFiltrosNuqsState,
  legacyStatus?: string | null,
): CasosFiltrosAplicados {
  let status_ids = (state.status_id ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_STATUS_IDS_FILTRO_CASOS);
  const legacy = legacyStatus?.trim();
  if (status_ids.length === 0 && legacy) {
    status_ids = [legacy];
  }

  return {
    produto: state.produto ?? "",
    versao: state.versao ?? "",
    modulo: state.modulo ?? "",
    tipo_categoria: state.tipo_categoria ?? "",
    tipo_abertura: state.tipo_abertura ?? "",
    descricao_resumo: state.descricao_resumo ?? "",
    status_ids,
    projeto_id: state.projeto_id ?? "",
    usuario_abertura_id: state.usuario_abertura_id ?? "",
    usuario_dev_id: state.usuario_dev_id ?? "",
    usuario_qa_id: state.usuario_qa_id ?? "",
    data_producao_inicio: state.data_producao_inicio ?? "",
    data_producao_fim: state.data_producao_fim ?? "",
  };
}

export function filtrosAplicadosToNuqsState(
  filtros: CasosFiltrosAplicados,
): CasosFiltrosNuqsUpdate {
  return {
    produto: filtros.produto.trim() || null,
    versao: filtros.versao.trim() || null,
    modulo: filtros.modulo.trim() || null,
    tipo_categoria: filtros.tipo_categoria.trim() || null,
    tipo_abertura: filtros.tipo_abertura.trim() || null,
    descricao_resumo: filtros.descricao_resumo.trim() || null,
    projeto_id: filtros.projeto_id.trim() || null,
    usuario_abertura_id: filtros.usuario_abertura_id.trim() || null,
    usuario_dev_id: filtros.usuario_dev_id.trim() || null,
    usuario_qa_id: filtros.usuario_qa_id.trim() || null,
    data_producao_inicio: filtros.data_producao_inicio.trim() || null,
    data_producao_fim: filtros.data_producao_fim.trim() || null,
    status_id:
      filtros.status_ids.length > 0
        ? filtros.status_ids.slice(0, MAX_STATUS_IDS_FILTRO_CASOS)
        : null,
  };
}

export function resolveCategoriaIdFromTipo(
  tipoCategoria: string,
  categorias: Categoria[],
): string {
  const t = tipoCategoria?.trim();
  if (!t) return "";
  const byLabel = categorias.find((c) => c.tipo_categoria === t);
  if (byLabel) return byLabel.id;
  const byId = categorias.find((c) => c.id === t);
  return byId ? byId.id : t;
}

/** Valor persistido na URL / API: texto da versão (não sequencia). */
export function normalizeVersaoForFiltrosAplicados(
  versao: string,
  versoes?: Versao[] | null,
): string {
  const trimmed = String(versao ?? "").trim();
  if (!trimmed) return "";
  return resolveVersaoProdutoForApi(trimmed, versoes) || trimmed;
}

export function formToFiltrosAplicados(
  values: CasosFiltersForm,
  categorias: Categoria[],
  versoes?: Versao[] | null,
): CasosFiltrosAplicados {
  let tipo_categoria = "";
  if (values.categoria?.trim()) {
    const categoria = categorias.find((c) => c.id === values.categoria.trim());
    tipo_categoria = categoria?.tipo_categoria ?? values.categoria.trim();
  }

  const tipo_abertura =
    values.tipo_abertura === "CASO" || values.tipo_abertura === "REPORT"
      ? values.tipo_abertura
      : "";

  return {
    produto: values.produto?.trim() ?? "",
    versao: normalizeVersaoForFiltrosAplicados(
      values.versao?.trim() ?? "",
      versoes,
    ),
    modulo: values.modulo?.trim() ?? "",
    tipo_categoria,
    tipo_abertura,
    descricao_resumo: values.descricao_resumo?.trim() ?? "",
    status_ids: (values.status_ids ?? [])
      .map((id) => String(id).trim())
      .filter(Boolean)
      .slice(0, MAX_STATUS_IDS_FILTRO_CASOS),
    projeto_id: values.projeto_id?.trim() ?? "",
    usuario_abertura_id: values.usuario_abertura_id?.trim() ?? "",
    usuario_dev_id: values.devAtribuido?.trim() ?? "",
    usuario_qa_id: values.qaAtribuido?.trim() ?? "",
    data_producao_inicio: dateToYmd(values.data_producao_inicio) ?? "",
    data_producao_fim: dateToYmd(values.data_producao_fim) ?? "",
  };
}

export function filtrosToFormDefaults(
  filtros: CasosFiltrosAplicados,
  categorias: Categoria[],
  versoes?: Versao[] | null,
): CasosFiltersForm {
  const categoriaId = resolveCategoriaIdFromTipo(
    filtros.tipo_categoria,
    categorias,
  );

  return {
    produto: filtros.produto,
    versao: resolveVersaoSequenciaForForm(filtros.versao, versoes),
    modulo: filtros.modulo,
    categoria: categoriaId || filtros.tipo_categoria,
    tipo_abertura:
      filtros.tipo_abertura === "CASO" || filtros.tipo_abertura === "REPORT"
        ? filtros.tipo_abertura
        : "",
    descricao_resumo: filtros.descricao_resumo,
    projeto_id: filtros.projeto_id,
    status_ids: [...filtros.status_ids].slice(0, MAX_STATUS_IDS_FILTRO_CASOS),
    usuario_abertura_id: filtros.usuario_abertura_id,
    devAtribuido: filtros.usuario_dev_id,
    qaAtribuido: filtros.usuario_qa_id,
    data_producao_inicio: parseYmdToDate(filtros.data_producao_inicio),
    data_producao_fim: parseYmdToDate(filtros.data_producao_fim),
  };
}

export function hasFiltersApplied(filtros: CasosFiltrosAplicados): boolean {
  if (filtros.status_ids.length > 0) return true;
  if (filtros.usuario_abertura_id?.trim()) return true;
  return (
    !!filtros.produto?.trim() ||
    !!filtros.versao?.trim() ||
    !!filtros.modulo?.trim() ||
    !!filtros.tipo_categoria?.trim() ||
    !!filtros.tipo_abertura?.trim() ||
    !!filtros.descricao_resumo?.trim() ||
    !!filtros.projeto_id?.trim() ||
    !!filtros.usuario_dev_id?.trim() ||
    !!filtros.usuario_qa_id?.trim() ||
    !!filtros.data_producao_inicio?.trim() ||
    !!filtros.data_producao_fim?.trim()
  );
}

function parseVersaoProduto(
  versao: string,
  versoes?: Versao[] | null,
): string | undefined {
  const trimmed = String(versao ?? "").trim();
  if (!trimmed) return undefined;

  const resolved = resolveVersaoProdutoForApi(trimmed, versoes);
  if (!resolved) return undefined;

  if (
    versoes?.length &&
    isSequenciaNoCatalogo(trimmed, versoes) &&
    resolved === trimmed
  ) {
    return undefined;
  }

  return resolved;
}

export function needsVersaoCatalogToResolve(
  versao: string,
  versoes?: Versao[] | null,
): boolean {
  const trimmed = String(versao ?? "").trim();
  if (!trimmed || versoes?.length) return false;
  return !trimmed.includes("-") && /^\d+$/.test(trimmed);
}

export function filtrosToProjetoMemoriaParams(
  filtros: CasosFiltrosAplicados,
  versoes?: Versao[] | null,
): ProjetoMemoriaQueryParams {
  const versaoProduto = parseVersaoProduto(filtros.versao, versoes);

  return {
    per_page: 15,
    ...(filtros.produto ? { produto_id: filtros.produto } : {}),
    ...(versaoProduto ? { versao_produto: versaoProduto } : {}),
    ...(filtros.status_ids.length > 0
      ? { status_id: filtros.status_ids }
      : {}),
    ...(filtros.modulo?.trim() ? { modulo: filtros.modulo.trim() } : {}),
    ...(filtros.tipo_categoria
      ? { tipo_categoria: filtros.tipo_categoria }
      : {}),
    ...(filtros.tipo_abertura?.trim()
      ? {
          tipo_abertura:
            filtros.tipo_abertura.trim() === "CASO" ||
            filtros.tipo_abertura.trim() === "REPORT"
              ? (filtros.tipo_abertura.trim() as "CASO" | "REPORT")
              : undefined,
        }
      : {}),
    ...(filtros.descricao_resumo?.trim()
      ? { descricao_resumo: filtros.descricao_resumo.trim() }
      : {}),
    ...(filtros.projeto_id?.trim()
      ? { projeto_id: filtros.projeto_id.trim() }
      : {}),
    ...(filtros.usuario_abertura_id?.trim()
      ? { usuario_abertura_id: filtros.usuario_abertura_id.trim() }
      : {}),
    ...(filtros.usuario_dev_id?.trim()
      ? { usuario_dev_id: filtros.usuario_dev_id.trim() }
      : {}),
    ...(filtros.usuario_qa_id?.trim()
      ? { usuario_qa_id: filtros.usuario_qa_id.trim() }
      : {}),
    ...(filtros.data_producao_inicio?.trim()
      ? { data_producao_inicio: filtros.data_producao_inicio.trim() }
      : {}),
    ...(filtros.data_producao_fim?.trim()
      ? { data_producao_fim: filtros.data_producao_fim.trim() }
      : {}),
  };
}

export function clearSheetFields(
  filtros: CasosFiltrosAplicados,
): CasosFiltrosAplicados {
  return {
    ...filtros,
    projeto_id: "",
    usuario_dev_id: "",
    usuario_qa_id: "",
    data_producao_inicio: "",
    data_producao_fim: "",
    tipo_abertura: "",
  };
}

export function filtrosQueryKey(filtros: CasosFiltrosAplicados): string {
  return JSON.stringify(filtros);
}
