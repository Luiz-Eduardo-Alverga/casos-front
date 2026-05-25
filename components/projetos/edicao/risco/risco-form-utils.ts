import type { CreateSgpRiscoRequest } from "@/interfaces/sgp-risco";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import {
  type RiscoFormValues,
  type RiscoNivelValue,
  RISCO_NIVEL_VALUES,
} from "@/components/projetos/edicao/risco/risco-form-schema";

const NIVEL_RANK: Record<RiscoNivelValue, number> = {
  BAIXO: 1,
  MEDIO: 2,
  ALTO: 3,
};

const RANK_TO_NIVEL: Record<number, RiscoNivelValue> = {
  1: "BAIXO",
  2: "MEDIO",
  3: "ALTO",
};

export function normalizeRiscoNivel(valor: string): RiscoNivelValue {
  const key = valor.trim().toUpperCase().replace(/A$/, "O");
  if (key === "BAIXO" || key === "BAIXA") return "BAIXO";
  if (key === "ALTO" || key === "ALTA") return "ALTO";
  if (key === "MEDIO" || key === "MEDIA") return "MEDIO";
  if (RISCO_NIVEL_VALUES.includes(key as RiscoNivelValue)) {
    return key as RiscoNivelValue;
  }
  return "BAIXO";
}

export function resolvePrioridadeFromNiveis(
  probalidade: string,
  impacto: string,
): RiscoNivelValue {
  const rankProb = NIVEL_RANK[normalizeRiscoNivel(probalidade)];
  const rankImpact = NIVEL_RANK[normalizeRiscoNivel(impacto)];
  const media = Math.round((rankProb + rankImpact) / 2);
  return RANK_TO_NIVEL[media] ?? "MEDIO";
}

function resolveDescricaoRisco(
  values: RiscoFormValues,
  fallback?: string,
): string {
  const label = values.idRiscoLabel?.trim();
  if (label) return label;
  if (fallback?.trim()) return fallback.trim();
  return "";
}

function resolveDatasForPayload(
  riscoExistente: SgpRiscoItem | null | undefined,
): string {
  const existente = riscoExistente?.datas?.trim();
  if (existente) {
    if (existente.includes("T")) return existente;
    const parsed = new Date(existente.replace(" ", "T"));
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return existente;
  }
  return new Date().toISOString();
}

export function buildCreateSgpRiscoPayload(
  values: RiscoFormValues,
  projetoId: number | string,
): CreateSgpRiscoRequest {
  const probalidade = normalizeRiscoNivel(values.probalidade);
  const impacto = normalizeRiscoNivel(values.impacto);

  return {
    sgp_cadastro_id: Number(projetoId),
    datas: new Date().toISOString(),
    descricao_risco: resolveDescricaoRisco(values),
    probalidade,
    impacto,
    prioridade: resolvePrioridadeFromNiveis(probalidade, impacto),
    contingencia: values.contingencia?.trim() ?? "",
    mitigacao: values.mitigacao?.trim() ?? "",
    id_risco: Number(values.idRisco),
  };
}

export function buildUpdateSgpRiscoPayload(
  values: RiscoFormValues,
  projetoId: number | string,
  riscoExistente: SgpRiscoItem,
): CreateSgpRiscoRequest {
  const probalidade = normalizeRiscoNivel(values.probalidade);
  const impacto = normalizeRiscoNivel(values.impacto);

  return {
    sgp_cadastro_id: Number(projetoId),
    datas: resolveDatasForPayload(riscoExistente),
    descricao_risco: resolveDescricaoRisco(
      values,
      riscoExistente.descricao_risco,
    ),
    probalidade,
    impacto,
    prioridade: resolvePrioridadeFromNiveis(probalidade, impacto),
    contingencia: values.contingencia?.trim() ?? "",
    mitigacao: values.mitigacao?.trim() ?? "",
    id_risco: Number(values.idRisco),
  };
}

export function riscoToFormValues(item: SgpRiscoItem): RiscoFormValues {
  return {
    idRisco: item.id_risco != null ? String(item.id_risco) : "",
    idRiscoLabel: item.descricao_risco?.trim() ?? "",
    probalidade: normalizeRiscoNivel(item.probalidade),
    impacto: normalizeRiscoNivel(item.impacto),
    mitigacao: item.mitigacao?.trim() ?? "",
    contingencia: item.contingencia?.trim() ?? "",
  };
}
