import type {
  CreateSgpRiscoHistoricoRequest,
  SgpRiscoHistoricoItem,
  UpdateSgpRiscoHistoricoRequest,
} from "@/interfaces/sgp-risco-historico";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import type { RiscoHistoricoFormValues } from "@/components/projetos/edicao/risco/risco-historico-form-schema";

/** Converte data da API (`YYYY-MM-DD HH:mm:ss` ou ISO) para Date local. */
export function parseHistoricoDataToDate(
  value: string | null | undefined,
): Date | undefined {
  if (!value?.trim()) return undefined;

  const trimmed = value.trim();
  if (trimmed.includes("T")) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return undefined;

  const [, year, month, day, hours = "0", minutes = "0", seconds = "0"] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  );
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatHistoricoDataForApi(date: Date): string {
  return date.toISOString();
}

export function buildCreateSgpRiscoHistoricoPayload(
  values: RiscoHistoricoFormValues,
): CreateSgpRiscoHistoricoRequest {
  return {
    id_seq: Number(values.idSeq),
    data_historico: formatHistoricoDataForApi(values.dataHistorico),
    descricao: values.descricao.trim(),
    impacto: values.impacto.trim(),
  };
}

export function buildUpdateSgpRiscoHistoricoPayload(
  values: RiscoHistoricoFormValues,
): UpdateSgpRiscoHistoricoRequest {
  return buildCreateSgpRiscoHistoricoPayload(values);
}

export function historicoToFormValues(
  item: SgpRiscoHistoricoItem,
): RiscoHistoricoFormValues {
  return {
    idSeq: String(item.id_seq ?? ""),
    dataHistorico:
      parseHistoricoDataToDate(item.data_historico) ?? new Date(),
    descricao: item.descricao?.trim() ?? "",
    impacto: item.impacto?.trim() ?? "",
  };
}

export function riscoPadraoToFormValues(
  risco: SgpRiscoItem,
): Partial<RiscoHistoricoFormValues> {
  return {
    idSeq: String(risco.sequencia),
    dataHistorico: new Date(),
  };
}
