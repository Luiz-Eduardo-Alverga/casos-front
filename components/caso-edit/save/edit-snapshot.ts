import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { normalizeAnaliseStatusForForm } from "../report-analise-modal/utils";

export interface CasoEditSnapshot {
  casoStatus: string;
  /** Valor normalizado exibido no formulário. */
  analiseStatusForm: string;
  /** Valor bruto persistido na API. */
  analiseStatusApi: string;
}

export function buildCasoEditSnapshot(item: ProjetoMemoriaItem): CasoEditSnapshot {
  return {
    casoStatus: String(item.caso?.status?.status_id ?? "1"),
    analiseStatusForm: normalizeAnaliseStatusForForm(item.report?.analise_status),
    analiseStatusApi: String(item.report?.analise_status ?? "").trim(),
  };
}

/** Compara status report efetivo com o valor persistido na API. */
export function reportStatusChangedVsApi(
  effectiveStatus: string,
  apiStatus: string,
): boolean {
  const api = apiStatus.trim();
  const effective = effectiveStatus.trim();

  if (effective === "0") {
    return api === "21";
  }

  if (!effective) return false;

  const apiNormalized = normalizeAnaliseStatusForForm(api);
  return effective !== api && effective !== apiNormalized;
}
