import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { parseApiDateTime } from "../utils";

/** Criticidade reconhecida no texto de prioridade do report. */
export type ReportCriticidade = "critico" | "alto" | "medio" | "baixo";

/** Grupos usados na ordenação por prazo. */
export type ReportPrazoGrupo = "vencido" | "urgente" | "noprazo" | "sem";

/** Filtro de prazo da listagem: vencidos ou qualquer prazo ainda válido. */
export type ReportPrazoFiltro = "vencido" | "noprazo";

/** Ordenação aplicada só na visualização Lista. */
export type ReportsSort = "prazo" | "criticidade" | "abertura";

export interface ReportsFiltrosLocaisState {
  criticidades: ReportCriticidade[];
  prazo: ReportPrazoFiltro | "";
  produtoIds: number[];
}

export type ReportsFiltroLocalSkip = "criticidade" | "prazo" | "produto";

export interface ReportProdutoAgg {
  id: number;
  nome: string;
  total: number;
  vencidos: number;
}

export interface ReportContagemCriticidade {
  critico: number;
  alto: number;
  medio: number;
  baixo: number;
}

export interface ReportContagemPrazo {
  vencido: number;
  noprazo: number;
}

export interface ReportListaGrupo {
  id: string;
  label: string;
  itens: ProjetoMemoriaItem[];
}

export const REPORT_CRITICIDADES: ReportCriticidade[] = [
  "critico",
  "alto",
  "medio",
  "baixo",
];

export const REPORT_CRITICIDADE_LABEL: Record<ReportCriticidade, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

const CRITICIDADE_RANK: Record<ReportCriticidade, number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  baixo: 3,
};

const CRITICIDADE_TERMOS: Array<{ key: ReportCriticidade; values: string[] }> = [
  { key: "critico", values: ["CRITIC", "CRÍTIC"] },
  { key: "alto", values: ["ALTO", "ALTA"] },
  { key: "medio", values: ["MEDIO", "MÉDIO", "MEDIA", "MÉDIA"] },
  { key: "baixo", values: ["BAIXO", "BAIXA"] },
];

const DAY_MS = 86_400_000;

const PRAZO_GRUPOS: Array<{ id: ReportPrazoGrupo; label: string }> = [
  { id: "vencido", label: "Vencidos" },
  { id: "urgente", label: "Vence em até 2 dias" },
  { id: "noprazo", label: "No prazo" },
  { id: "sem", label: "Sem prazo" },
];

export const EMPTY_FILTROS_LOCAIS: ReportsFiltrosLocaisState = {
  criticidades: [],
  prazo: "",
  produtoIds: [],
};

function prioridadeOf(item: ProjetoMemoriaItem): string {
  return (
    item.report?.prioridade?.trim() ||
    item.caso.caracteristicas?.prioridade ||
    ""
  );
}

function dataLimiteOf(item: ProjetoMemoriaItem): string | null {
  return item.report?.data_limite ?? null;
}

function aberturaTime(item: ProjetoMemoriaItem): number {
  return parseApiDateTime(item.caso.datas?.abertura)?.getTime() ?? Number.POSITIVE_INFINITY;
}

function prazoTime(item: ProjetoMemoriaItem): number {
  return parseApiDateTime(dataLimiteOf(item))?.getTime() ?? Number.POSITIVE_INFINITY;
}

/** Classifica a prioridade no mesmo critério de `getPrioridadeStyle`. */
export function classifyCriticidade(
  prioridade: string | null | undefined,
): ReportCriticidade | null {
  const upper = String(prioridade ?? "")
    .trim()
    .toUpperCase();
  if (!upper) return null;
  for (const item of CRITICIDADE_TERMOS) {
    if (item.values.some((value) => upper.includes(value))) return item.key;
  }
  return null;
}

/**
 * Bucket de prazo em dias de 24h a partir da data limite.
 * Sem data fica fora dos chips Vencidos / Não vencidos.
 */
export function classifyPrazo(
  dataLimite: string | null | undefined,
  now = Date.now(),
): ReportPrazoGrupo {
  const limite = parseApiDateTime(dataLimite);
  if (!limite) return "sem";
  const diff = limite.getTime() - now;
  if (diff < 0) return "vencido";
  const days = Math.floor(diff / DAY_MS);
  return days <= 2 ? "urgente" : "noprazo";
}

function criticidadeRank(item: ProjetoMemoriaItem): number {
  const key = classifyCriticidade(prioridadeOf(item));
  return key ? CRITICIDADE_RANK[key] : 99;
}

function matchesPrazo(
  grupo: ReportPrazoGrupo,
  filtro: ReportPrazoFiltro | "",
): boolean {
  if (!filtro) return true;
  if (filtro === "vencido") return grupo === "vencido";
  return grupo === "urgente" || grupo === "noprazo";
}

export function matchesFiltroLocal(
  item: ProjetoMemoriaItem,
  state: ReportsFiltrosLocaisState,
  skip?: ReportsFiltroLocalSkip,
  now = Date.now(),
): boolean {
  if (skip !== "criticidade" && state.criticidades.length > 0) {
    const criticidade = classifyCriticidade(prioridadeOf(item));
    if (!criticidade || !state.criticidades.includes(criticidade)) return false;
  }

  if (skip !== "prazo" && state.prazo) {
    const grupo = classifyPrazo(dataLimiteOf(item), now);
    if (!matchesPrazo(grupo, state.prazo)) return false;
  }

  if (skip !== "produto" && state.produtoIds.length > 0) {
    const produtoId = item.produto?.id;
    if (produtoId == null || !state.produtoIds.includes(produtoId)) return false;
  }

  return true;
}

/** Mantém a ordem da API e aplica só os filtros locais. */
export function filtrarItens(
  itens: ProjetoMemoriaItem[],
  state: ReportsFiltrosLocaisState,
  now = Date.now(),
): ProjetoMemoriaItem[] {
  return itens.filter((item) => matchesFiltroLocal(item, state, undefined, now));
}

export function contarCriticidades(
  itens: ProjetoMemoriaItem[],
  state: ReportsFiltrosLocaisState,
  now = Date.now(),
): ReportContagemCriticidade {
  const counts: ReportContagemCriticidade = {
    critico: 0,
    alto: 0,
    medio: 0,
    baixo: 0,
  };

  for (const item of itens) {
    if (!matchesFiltroLocal(item, state, "criticidade", now)) continue;
    const criticidade = classifyCriticidade(prioridadeOf(item));
    if (criticidade) counts[criticidade] += 1;
  }

  return counts;
}

export function contarPrazos(
  itens: ProjetoMemoriaItem[],
  state: ReportsFiltrosLocaisState,
  now = Date.now(),
): ReportContagemPrazo {
  const counts: ReportContagemPrazo = { vencido: 0, noprazo: 0 };

  for (const item of itens) {
    if (!matchesFiltroLocal(item, state, "prazo", now)) continue;
    const grupo = classifyPrazo(dataLimiteOf(item), now);
    if (grupo === "vencido") counts.vencido += 1;
    else if (grupo === "urgente" || grupo === "noprazo") counts.noprazo += 1;
  }

  return counts;
}

export function agregarProdutos(
  itens: ProjetoMemoriaItem[],
  state: ReportsFiltrosLocaisState,
  nomes: Readonly<Record<number, string>> = {},
  now = Date.now(),
): ReportProdutoAgg[] {
  const map = new Map<number, ReportProdutoAgg>();

  for (const item of itens) {
    if (!matchesFiltroLocal(item, state, "produto", now)) continue;
    const id = item.produto?.id;
    if (id == null) continue;
    const nome = item.produto?.nome?.trim() || nomes[id] || "Produto";
    const atual = map.get(id) ?? { id, nome, total: 0, vencidos: 0 };
    atual.total += 1;
    if (classifyPrazo(dataLimiteOf(item), now) === "vencido") atual.vencidos += 1;
    map.set(id, atual);
  }

  for (const id of state.produtoIds) {
    if (map.has(id)) continue;
    map.set(id, {
      id,
      nome: nomes[id] || "Produto",
      total: 0,
      vencidos: 0,
    });
  }

  return [...map.values()].sort(
    (a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

function byCriticidadeThenPrazo(
  a: ProjetoMemoriaItem,
  b: ProjetoMemoriaItem,
): number {
  return criticidadeRank(a) - criticidadeRank(b) || prazoTime(a) - prazoTime(b);
}

function byPrazoThenCriticidade(
  a: ProjetoMemoriaItem,
  b: ProjetoMemoriaItem,
): number {
  return prazoTime(a) - prazoTime(b) || criticidadeRank(a) - criticidadeRank(b);
}

/** Agrupa a lista já filtrada conforme a ordenação local. */
export function agruparItens(
  itens: ProjetoMemoriaItem[],
  sort: ReportsSort,
  now = Date.now(),
): ReportListaGrupo[] {
  if (sort === "abertura") {
    return [
      {
        id: "abertura",
        label: "Mais antigos primeiro",
        itens: [...itens].sort((a, b) => aberturaTime(a) - aberturaTime(b)),
      },
    ].filter((grupo) => grupo.itens.length > 0);
  }

  if (sort === "criticidade") {
    const grupos: ReportListaGrupo[] = REPORT_CRITICIDADES.map((key) => ({
      id: key,
      label: REPORT_CRITICIDADE_LABEL[key],
      itens: itens
        .filter((item) => classifyCriticidade(prioridadeOf(item)) === key)
        .sort(byPrazoThenCriticidade),
    }));

    const outros = itens
      .filter((item) => classifyCriticidade(prioridadeOf(item)) == null)
      .sort(byPrazoThenCriticidade);

    if (outros.length > 0) {
      grupos.push({ id: "outros", label: "Outros", itens: outros });
    }

    return grupos.filter((grupo) => grupo.itens.length > 0);
  }

  return PRAZO_GRUPOS.map((grupo) => ({
    id: grupo.id,
    label: grupo.label,
    itens: itens
      .filter((item) => classifyPrazo(dataLimiteOf(item), now) === grupo.id)
      .sort(byCriticidadeThenPrazo),
  })).filter((grupo) => grupo.itens.length > 0);
}
