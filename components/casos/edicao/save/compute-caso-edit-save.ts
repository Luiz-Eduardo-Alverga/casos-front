import type { StatusItem } from "@/services/auxiliar/status";
import type { CasoUpdateReportFields } from "@/components/casos/shared/payload";
import {
  buildAnaliseConclusaoByStatus,
  resolveCasoStatusFromReport,
  resolveReportStatusFromCaso,
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
  };
  statusList: readonly StatusItem[] | undefined;
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
 * Só inclui report quando status ou analiseStatus foram alterados pelo usuário
 * e o valor efetivo difere do persistido na API.
 */
export function computeCasoEditSave({
  isReport,
  snapshot,
  formData,
  dirtyFields,
  statusList,
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

  if (!statusDirty && !analiseDirty) {
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

  if (reportFoiLimpadoDe21) {
    statusReportFinal = "0";
  } else if (analiseDirty && statusReportSelecionadoAlterado) {
    const statusCasoPorReport = resolveCasoStatusFromReport(
      statusList,
      statusReportSelecionado,
    );
    if (statusCasoPorReport !== undefined) {
      statusCasoFinal = statusCasoPorReport;
    }
  } else if (statusDirty && !analiseDirty) {
    if (statusReportSelecionado === "" && statusReportAtual === "21") {
      statusReportFinal = "0";
    } else if (statusReportSelecionado === "") {
      const synced = resolveReportStatusFromCaso(
        statusList,
        statusCasoFinal,
        formData.versao,
      );
      if (synced !== undefined) {
        statusReportFinal = synced;
      }
    }
  }

  const forceStatusEDevPorAnalise =
    analiseDirty &&
    statusReportSelecionadoAlterado &&
    statusReportSelecionado === "21";

  if (forceStatusEDevPorAnalise) {
    devAtribuido = "631";
    statusCasoFinal = 8;
  }

  if (
    !reportFoiLimpadoDe21 &&
    !reportStatusChangedVsApi(statusReportFinal, snapshot.analiseStatusApi)
  ) {
    return { statusCasoFinal, devAtribuido, reportFields: undefined };
  }

  const statusReportAprovado =
    statusReportFinal !== "21" && statusReportFinal !== "0";
  const analiseDataConclusao = buildAnaliseConclusaoByStatus(statusReportFinal);

  return {
    statusCasoFinal,
    devAtribuido,
    reportFields: {
      aprovado: statusReportAprovado,
      analiseStatus: statusReportFinal,
      analiseDataConclusao,
      dataLimite: forceStatusEDevPorAnalise ? null : analiseDataConclusao,
      reportAnaliseUsuarioId:
        userId != null && String(userId).trim() !== ""
          ? String(userId)
          : undefined,
    },
  };
}
