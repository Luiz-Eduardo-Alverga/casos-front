import type { StatusItem } from "@/services/auxiliar/status";
import type { VisaoGeralItem } from "@/services/sprint/get-visao-geral";

/** Colunas de status da tabela "Geral por versão" na Minha Visão. */
export type VisaoGeralStatusColumn =
  | "abertos"
  | "aguardando_teste"
  | "retorno"
  | "suspenso"
  | "resolvidos";

const VISAO_STATUS_COLUMN_MATCHERS: Record<
  VisaoGeralStatusColumn,
  string[]
> = {
  abertos: ["ABERTO"],
  aguardando_teste: ["AGUARDANDO TESTE"],
  retorno: ["RETORNO"],
  suspenso: ["SUSPENSO"],
  resolvidos: ["RESOLVIDO", "CONCLUÍDO", "CONCLUIDO"],
};

/**
 * Resolve o `Registro` do status de caso a partir do catálogo,
 * batendo `tipo` (case-insensitive / includes) com as keywords da coluna.
 */
export function resolveVisaoStatusId(
  column: VisaoGeralStatusColumn,
  statusList: StatusItem[] | undefined,
): string | null {
  if (!statusList?.length) return null;
  const matchers = VISAO_STATUS_COLUMN_MATCHERS[column];
  const casoStatuses = statusList.filter((item) => item.tipo_status === "CASO");

  for (const matcher of matchers) {
    const needle = matcher.toUpperCase();
    const found = casoStatuses.find((item) => {
      const tipo = (item.tipo ?? "").trim().toUpperCase();
      return tipo === needle || tipo.includes(needle);
    });
    if (found) return String(found.Registro);
  }

  return null;
}

/** Monta a URL da listagem de casos com produto, versão e status pré-filtrados. */
export function buildCasosListagemHref(params: {
  produtoId: string | number;
  versao?: string;
  statusId: string;
}): string {
  const search = new URLSearchParams();
  search.set("produto", String(params.produtoId));
  if (params.versao?.trim()) {
    search.set("versao", params.versao.trim());
  }
  search.append("status_id", params.statusId);
  return `/casos?${search.toString()}`;
}

/** Fundos de avatar (rotação por hash do nome — sem cores hardcoded em hex). */
const AVATAR_BG_CLASSES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-rose-500",
] as const;

export function getAvatarBgClass(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash << 5) - hash + nome.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_BG_CLASSES.length;
  return AVATAR_BG_CLASSES[index];
}

export function getInitials(nome: string): string {
  const clean = nome.replace(/^\d+/, "").trim();
  return clean.slice(0, 2).toUpperCase() || nome.slice(0, 2).toUpperCase();
}

/** Normaliza o campo `entregue` (string vinda da API) para boolean. */
export function isEntregue(entregue: string | null | undefined): boolean {
  const value = (entregue ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "sim";
}

/**
 * Regra de negócio para o KPI "Casos para Testar (QA)": soma de casos ainda em
 * aberto no ciclo (abertos + aguardando_teste + retorno), excluindo suspensos e
 * já resolvidos — representa a carga de trabalho pendente de QA.
 */
export function sumVisaoGeralPendente(data: VisaoGeralItem[] | undefined): number {
  if (!data?.length) return 0;
  return data.reduce((total, item) => total + item.aguardando_teste, 0);
}
