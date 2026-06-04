import type { CasoUpdateReportFields } from "@/components/casos/shared/payload";
import {
  buildAnaliseConclusaoByStatus,
  resolveCasoStatusFromReport,
  resolveReportStatusFromCaso,
  resolveStatusFromVersaoChange,
  shouldClearReportAnaliseForCasoStatus,
} from "../report-analise-modal/utils";
import {
  type CasoEditSnapshot,
  reportStatusChangedVsApi,
} from "./edit-snapshot";

export interface ComputeCasoEditSaveArgs {
  isReport: boolean;
  snapshot: CasoEditSnapshot;
  formData: {
    status: string;
    analiseStatus?: string;
    versao: string;
    devAtribuido: string;
  };
  dirtyFields: {
    status?: boolean;
    analiseStatus?: boolean;
    versao?: boolean;
  };
  defaultCasoStatusId: number;
  userId?: string | number | null;
}

export interface CasoEditSaveResult {
  statusCasoFinal: number;
  devAtribuido: string;
  /** Quando undefined, nenhum campo report_* deve ir no PATCH. */
  reportFields?: CasoUpdateReportFields;
}

/**
 * Resolve status final do caso, dev atribuído e campos de report para o PATCH.
 * Inclui report quando status/analiseStatus foram alterados pelo usuário,
 * ou quando a versão mudou e induz status caso 1 + report 20/22 (não BUG/MELHORIA).
 */
export function computeCasoEditSave({
  isReport,
  snapshot,
  formData,
  dirtyFields,
  defaultCasoStatusId,
  userId,
}: ComputeCasoEditSaveArgs): CasoEditSaveResult {
  let statusCasoFinal = Number(formData.status) || defaultCasoStatusId;
  let devAtribuido = formData.devAtribuido;

  if (!isReport) {
    return { statusCasoFinal, devAtribuido, reportFields: undefined };
  }

  const statusDirty = Boolean(dirtyFields.status);
  const analiseDirty = Boolean(dirtyFields.analiseStatus);
  const versaoDirty = Boolean(dirtyFields.versao);

  const statusPorVersaoAlterada = versaoDirty
    ? resolveStatusFromVersaoChange(formData.versao)
    : null;

  const persistirReportPorVersao =
    versaoDirty &&
    !statusDirty &&
    !analiseDirty &&
    statusPorVersaoAlterada != null;

  if (!statusDirty && !analiseDirty && !persistirReportPorVersao) {
    return { statusCasoFinal, devAtribuido, reportFields: undefined };
  }

  const statusReportAtual = snapshot.analiseStatusForm;
  const statusReportSelecionado = (formData.analiseStatus ?? "").trim();
  let statusReportFinal = statusReportSelecionado;

  const statusReportSelecionadoAlterado =
    statusReportSelecionado !== "" &&
    statusReportSelecionado !== statusReportAtual;

  const reportFoiLimpadoDe21 =
    statusReportAtual === "21" && statusReportSelecionado === "";

  if (persistirReportPorVersao && statusPorVersaoAlterada) {
    statusCasoFinal = statusPorVersaoAlterada.casoStatus;
    statusReportFinal = statusPorVersaoAlterada.reportStatus;
  } else if (reportFoiLimpadoDe21) {
    statusReportFinal = "0";
  } else if (analiseDirty && statusReportSelecionadoAlterado) {
    const statusCasoPorReport = resolveCasoStatusFromReport(
      statusReportSelecionado,
      statusCasoFinal,
    );
    if (statusCasoPorReport !== undefined) {
      statusCasoFinal = statusCasoPorReport;
    }
  } else if (statusDirty && !analiseDirty) {
    if (
      shouldClearReportAnaliseForCasoStatus(statusCasoFinal) ||
      (statusReportSelecionado === "" && statusReportAtual === "21")
    ) {
      statusReportFinal = "0";
    } else if (statusReportSelecionado === "") {
      const synced = resolveReportStatusFromCaso(statusCasoFinal);
      if (synced !== undefined) {
        statusReportFinal = synced;
      }
    }
  }

  const forceDev631PorReport21 =
    !persistirReportPorVersao &&
    analiseDirty &&
    statusReportSelecionadoAlterado &&
    statusReportSelecionado === "21";

  const forceDev631PorCaso8 =
    !persistirReportPorVersao && statusDirty && statusCasoFinal === 8;

  if (forceDev631PorReport21) {
    devAtribuido = "631";
    statusCasoFinal = 8;
  } else if (forceDev631PorCaso8) {
    devAtribuido = "631";
  }

  const usuarioSelecionouCaso8 =
    !persistirReportPorVersao && statusDirty && statusCasoFinal === 8;

  if (
    !reportFoiLimpadoDe21 &&
    !reportStatusChangedVsApi(statusReportFinal, snapshot.analiseStatusApi)
  ) {
    if (usuarioSelecionouCaso8) {
      return {
        statusCasoFinal,
        devAtribuido: "631",
        reportFields: { dataLimite: null },
      };
    }
    return { statusCasoFinal, devAtribuido, reportFields: undefined };
  }

  const statusReportAprovado =
    statusReportFinal !== "21" && statusReportFinal !== "0";
  const analiseDataConclusao = buildAnaliseConclusaoByStatus(statusReportFinal);

  const deveLimparDataLimite =
    forceDev631PorReport21 ||
    forceDev631PorCaso8 ||
    statusReportFinal === "21" ||
    statusCasoFinal === 8;

  return {
    statusCasoFinal,
    devAtribuido,
    reportFields: {
      aprovado: statusReportAprovado,
      analiseStatus: statusReportFinal,
      analiseDataConclusao,
      ...(deveLimparDataLimite ? { dataLimite: null } : {}),
      reportAnaliseUsuarioId:
        userId != null && String(userId).trim() !== ""
          ? String(userId)
          : undefined,
    },
  };
}
