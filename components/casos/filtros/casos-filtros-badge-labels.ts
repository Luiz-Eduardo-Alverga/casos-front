import type { Categoria } from "@/services/auxiliar/categorias";
import type { Produto } from "@/services/auxiliar/produtos";
import type { Setor } from "@/services/auxiliar/setores";
import type { StatusItem } from "@/services/auxiliar/status";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { Versao } from "@/services/auxiliar/versoes";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import {
  buildVersaoComboboxOptions,
  resolveVersaoProdutoForApi,
} from "@/components/casos/shared/versao-combobox";
import { formatDateYmdToBr } from "@/components/painel-kanban/horas-analiticas-modal/utils";
import { NAO_PLANEJADO_FILTRO_OPTIONS } from "@/components/filtros/nao-planejado-filtro";

export const MAX_CASOS_FILTROS_BADGES_VISIVEIS = 7;

export type CasosFiltroBadgeKey =
  | "produto"
  | "versao"
  | "status_ids"
  | "projeto_id"
  | "setor"
  | "modulo"
  | "tipo_categoria"
  | "descricao_resumo"
  | "tipo_abertura"
  | "usuario_abertura_id"
  | "usuario_dev_id"
  | "usuario_qa_id"
  | "data_abertura_inicio"
  | "data_abertura_final"
  | "data_producao_inicio"
  | "data_producao_fim"
  | "nao_planejado_filtro";

export interface CasosFiltroBadgeItem {
  key: CasosFiltroBadgeKey;
  label: string;
}

export interface CasosFiltrosBadgeCatalogs {
  produtos: Produto[];
  statusList: StatusItem[];
  categorias: Categoria[];
  usuarios: Usuario[];
  setores: Setor[];
  versoes?: Versao[];
}

function resolveProdutoLabel(id: string, produtos: Produto[]): string {
  const p = produtos.find((x) => String(x.id) === id);
  return p?.nome_projeto?.trim() || id;
}

function resolveVersaoLabel(versao: string, versoes?: Versao[]): string {
  const v = versao.trim();
  if (!v) return "";

  if (versoes?.length) {
    const options = buildVersaoComboboxOptions(versoes);
    const bySequencia = options.find((o) => o.value === v);
    if (bySequencia) return bySequencia.label;

    const texto = resolveVersaoProdutoForApi(v, versoes);
    if (texto) return texto;
  }

  const part = v.split("-").slice(1).join("-").trim();
  return part || v;
}

function resolveStatusLabel(ids: string[], statusList: StatusItem[]): string {
  const casoStatus = statusList.filter((s) => s.tipo_status === "CASO");
  const labels = ids
    .map((id) => {
      const s = casoStatus.find((x) => String(x.Registro) === id);
      return s?.descricao ?? s?.tipo ?? id;
    })
    .filter(Boolean);
  return labels.join(", ");
}

function resolveSetorLabel(id: string, setores: Setor[]): string {
  const s = setores.find((x) => String(x.id) === id);
  return s?.nome?.trim() || id;
}

function resolveUsuarioLabel(id: string, usuarios: Usuario[]): string {
  const u = usuarios.find((x) => x.id === id);
  return u?.nome_suporte?.trim() || id;
}

function resolveCategoriaLabel(tipo: string, categorias: Categoria[]): string {
  const t = tipo.trim();
  if (!t) return "";
  const byTipo = categorias.find((c) => c.tipo_categoria === t);
  if (byTipo) return byTipo.tipo_categoria;
  const byId = categorias.find((c) => c.id === t);
  return byId?.tipo_categoria ?? t;
}

export function removeFilterFromAplicados(
  filtros: CasosFiltrosAplicados,
  key: CasosFiltroBadgeKey,
): CasosFiltrosAplicados {
  switch (key) {
    case "produto":
      return { ...filtros, produto: "" };
    case "versao":
      return { ...filtros, versao: "" };
    case "status_ids":
      return { ...filtros, status_ids: [] };
    case "projeto_id":
      return { ...filtros, projeto_id: "" };
    case "setor":
      return { ...filtros, setor: "" };
    case "modulo":
      return { ...filtros, modulo: "" };
    case "tipo_categoria":
      return { ...filtros, tipo_categoria: "" };
    case "descricao_resumo":
      return { ...filtros, descricao_resumo: "" };
    case "tipo_abertura":
      return { ...filtros, tipo_abertura: "" };
    case "usuario_abertura_id":
      return { ...filtros, usuario_abertura_id: "" };
    case "usuario_dev_id":
      return { ...filtros, usuario_dev_id: "" };
    case "usuario_qa_id":
      return { ...filtros, usuario_qa_id: "" };
    case "data_abertura_inicio":
      return { ...filtros, data_abertura_inicio: "" };
    case "data_abertura_final":
      return { ...filtros, data_abertura_final: "" };
    case "data_producao_inicio":
      return { ...filtros, data_producao_inicio: "" };
    case "data_producao_fim":
      return { ...filtros, data_producao_fim: "" };
    case "nao_planejado_filtro":
      return { ...filtros, nao_planejado_filtro: "todos" };
    default:
      return filtros;
  }
}

export function buildCasosFiltrosBadgeItems(
  filtros: CasosFiltrosAplicados,
  catalogs: CasosFiltrosBadgeCatalogs,
): CasosFiltroBadgeItem[] {
  const items: CasosFiltroBadgeItem[] = [];

  if (filtros.produto?.trim()) {
    items.push({
      key: "produto",
      label: `Produto: ${resolveProdutoLabel(filtros.produto.trim(), catalogs.produtos)}`,
    });
  }

  if (filtros.versao?.trim()) {
    items.push({
      key: "versao",
      label: `Versão: ${resolveVersaoLabel(filtros.versao, catalogs.versoes)}`,
    });
  }

  if (filtros.status_ids.length > 0) {
    items.push({
      key: "status_ids",
      label: `Status: ${resolveStatusLabel(filtros.status_ids, catalogs.statusList)}`,
    });
  }

  if (filtros.projeto_id?.trim()) {
    items.push({
      key: "projeto_id",
      label: `Projeto: ${filtros.projeto_id.trim()}`,
    });
  }

  if (filtros.setor?.trim()) {
    items.push({
      key: "setor",
      label: `Setor: ${resolveSetorLabel(filtros.setor.trim(), catalogs.setores)}`,
    });
  }

  if (filtros.modulo?.trim()) {
    items.push({
      key: "modulo",
      label: `Módulo: ${filtros.modulo.trim()}`,
    });
  }

  if (filtros.tipo_categoria?.trim()) {
    items.push({
      key: "tipo_categoria",
      label: `Categoria: ${resolveCategoriaLabel(filtros.tipo_categoria, catalogs.categorias)}`,
    });
  }

  if (filtros.descricao_resumo?.trim()) {
    const texto = filtros.descricao_resumo.trim();
    const truncado = texto.length > 40 ? `${texto.slice(0, 40)}…` : texto;
    items.push({
      key: "descricao_resumo",
      label: `Descrição: ${truncado}`,
    });
  }

  if (filtros.tipo_abertura?.trim()) {
    items.push({
      key: "tipo_abertura",
      label: `Tipo de abertura: ${filtros.tipo_abertura.trim()}`,
    });
  }

  if (filtros.usuario_dev_id?.trim()) {
    items.push({
      key: "usuario_dev_id",
      label: `Desenvolvedor: ${resolveUsuarioLabel(filtros.usuario_dev_id.trim(), catalogs.usuarios)}`,
    });
  }

  if (filtros.usuario_qa_id?.trim()) {
    items.push({
      key: "usuario_qa_id",
      label: `QA: ${resolveUsuarioLabel(filtros.usuario_qa_id.trim(), catalogs.usuarios)}`,
    });
  }

  if (filtros.usuario_abertura_id?.trim()) {
    items.push({
      key: "usuario_abertura_id",
      label: `Relator: ${resolveUsuarioLabel(filtros.usuario_abertura_id.trim(), catalogs.usuarios)}`,
    });
  }

  if (filtros.data_abertura_inicio?.trim()) {
    items.push({
      key: "data_abertura_inicio",
      label: `Abertura (início): ${formatDateYmdToBr(filtros.data_abertura_inicio)}`,
    });
  }

  if (filtros.data_abertura_final?.trim()) {
    items.push({
      key: "data_abertura_final",
      label: `Abertura (fim): ${formatDateYmdToBr(filtros.data_abertura_final)}`,
    });
  }

  if (filtros.data_producao_inicio?.trim()) {
    items.push({
      key: "data_producao_inicio",
      label: `Produção (início): ${formatDateYmdToBr(filtros.data_producao_inicio)}`,
    });
  }

  if (filtros.data_producao_fim?.trim()) {
    items.push({
      key: "data_producao_fim",
      label: `Produção (fim): ${formatDateYmdToBr(filtros.data_producao_fim)}`,
    });
  }

  if (filtros.nao_planejado_filtro !== "todos") {
    const option = NAO_PLANEJADO_FILTRO_OPTIONS.find(
      (opt) => opt.value === filtros.nao_planejado_filtro,
    );
    items.push({
      key: "nao_planejado_filtro",
      label: `Planejamento: ${option?.label ?? filtros.nao_planejado_filtro}`,
    });
  }

  return items;
}
