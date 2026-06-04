import {
  deveAplicarDev631PorStatus,
} from "@/lib/report/apply-dev-631-form";
import {
  resolveCasoStatusFromReport,
  resolveReportStatusFromCaso,
  resolveStatusFromVersaoChange,
  shouldClearReportAnaliseForCasoStatus,
} from "../report-analise-modal/utils";

export interface CasoEditSyncInput {
  statusCaso: string;
  analiseStatus: string;
  versao: string;
  previousStatusCaso: string;
  previousAnaliseStatus: string;
  previousVersao: string;
  isReport: boolean;
}

export interface CasoEditSyncOutput {
  /** Novo valor de `status` a setar no form (shouldDirty: false). undefined = não mudar. */
  nextStatusCaso?: string;
  /** Novo valor de `analiseStatus` a setar no form (shouldDirty: false). undefined = não mudar. */
  nextAnaliseStatus?: string;
  /** Se deve aplicar dev 631 via applyDev631ToCasoEditForm. */
  nextDev631: boolean;
  /** Valores que devem ser guardados nos refs após aplicação. */
  nextPrevStatusCaso: string;
  nextPrevAnaliseStatus: string;
  nextPrevVersao: string;
}

/**
 * Função pura que calcula os campos a sincronizar no formulário de edição de caso/report
 * quando status, analiseStatus ou versão mudam. Não produz efeitos colaterais.
 *
 * Regras (por prioridade de trigger):
 * 1. Versão alterada (e não é BUG/MELHORIA) → status caso = 1, report = 20 ou 22.
 * 2. analiseStatus alterado → 21→caso 8, 23→caso 10, 20/22 com caso 8/10→caso 1 + dev631.
 * 3. statusCaso alterado → 8→21, 10→23, caso 1 ou report era "21" → limpa analiseStatus.
 */
export function computeCasoEditSync(input: CasoEditSyncInput): CasoEditSyncOutput {
  const {
    statusCaso,
    analiseStatus,
    versao,
    previousStatusCaso,
    previousAnaliseStatus,
    previousVersao,
    isReport,
  } = input;

  const noChange: CasoEditSyncOutput = {
    nextDev631: false,
    nextPrevStatusCaso: statusCaso,
    nextPrevAnaliseStatus: analiseStatus,
    nextPrevVersao: versao,
  };

  if (!isReport) return noChange;

  const statusAlterado = statusCaso !== previousStatusCaso;
  const analiseAlterado = analiseStatus !== previousAnaliseStatus;
  const versaoAlterada = versao !== previousVersao;

  // ── Ramo 1: versão alterada ────────────────────────────────────────────────
  if (versaoAlterada && !statusAlterado && !analiseAlterado) {
    const result = resolveStatusFromVersaoChange(versao);

    if (result) {
      return {
        nextStatusCaso: String(result.casoStatus),
        nextAnaliseStatus: result.reportStatus,
        nextDev631: false,
        nextPrevStatusCaso: String(result.casoStatus),
        nextPrevAnaliseStatus: result.reportStatus,
        nextPrevVersao: versao,
      };
    }

    // BUG ou MELHORIA: apenas atualiza ref de versão, sem mudar status
    return { ...noChange, nextPrevVersao: versao };
  }

  // ── Ramo 2: analise status alterado (não mudou caso) ──────────────────────
  if (analiseAlterado && !statusAlterado) {
    const dev631 = deveAplicarDev631PorStatus({ statusReport: analiseStatus });

    const statusCasoEquivalente = resolveCasoStatusFromReport(
      analiseStatus,
      statusCaso,
    );
    if (
      statusCasoEquivalente !== undefined &&
      statusCaso !== String(statusCasoEquivalente)
    ) {
      const dev631Extra = deveAplicarDev631PorStatus({
        statusCaso: statusCasoEquivalente,
      });
      return {
        nextStatusCaso: String(statusCasoEquivalente),
        nextDev631: dev631 || dev631Extra,
        nextPrevStatusCaso: String(statusCasoEquivalente),
        nextPrevAnaliseStatus: analiseStatus,
        nextPrevVersao: versao,
      };
    }

    return {
      nextDev631: dev631,
      nextPrevStatusCaso: statusCaso,
      nextPrevAnaliseStatus: analiseStatus,
      nextPrevVersao: versao,
    };
  }

  // ── Ramo 3: statusCaso alterado (não mudou analise) ───────────────────────
  if (statusAlterado && !analiseAlterado) {
    // Caso Aberto (id 1) ou report estava em "21" → limpar report
    if (
      shouldClearReportAnaliseForCasoStatus(statusCaso) ||
      analiseStatus === "21"
    ) {
      return {
        nextAnaliseStatus: "",
        nextDev631: false,
        nextPrevStatusCaso: statusCaso,
        nextPrevAnaliseStatus: "",
        nextPrevVersao: versao,
      };
    }

    const statusReportEquivalente = resolveReportStatusFromCaso(statusCaso);

    if (
      statusReportEquivalente !== undefined &&
      analiseStatus !== statusReportEquivalente
    ) {
      const dev631 = deveAplicarDev631PorStatus({
        statusCaso,
        statusReport: statusReportEquivalente,
      });
      return {
        nextAnaliseStatus: statusReportEquivalente,
        nextDev631: dev631,
        nextPrevStatusCaso: statusCaso,
        nextPrevAnaliseStatus: statusReportEquivalente,
        nextPrevVersao: versao,
      };
    }

    const dev631 = deveAplicarDev631PorStatus({
      statusCaso,
      statusReport: statusReportEquivalente ?? analiseStatus,
    });
    return {
      nextDev631: dev631,
      nextPrevStatusCaso: statusCaso,
      nextPrevAnaliseStatus: analiseStatus,
      nextPrevVersao: versao,
    };
  }

  return {
    ...noChange,
    nextPrevVersao: versao,
  };
}
