"use client";

import { useCallback } from "react";
import { Check, RotateCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import {
  applyDev631ToCasoEditForm,
  deveAplicarDev631PorStatus,
  type Dev631SetValue,
} from "@/lib/report/apply-dev-631-form";

import { CasoFormStatus } from "@/components/fields/caso-form-status";
import { Button } from "@/components/ui/button";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { mapStatusAvancar } from "@/components/caso-resumo-modal/utils";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import {
  buildAnaliseConclusaoByStatus,
  shouldClearReportAnaliseForCasoStatus,
} from "@/components/casos/edicao/report-analise-modal/utils";

interface CasoResumoStatusActionsProps {
  statusIdApi: number;
  memoriaQueryId: string;
  onStatusUpdated: () => void;
  statusDisabled?: boolean;
  getReportStatusFromCasoStatus?: (status: number) => string | undefined;
}

export function CasoResumoStatusActions({
  statusIdApi,
  memoriaQueryId,
  onStatusUpdated,
  statusDisabled = false,
  getReportStatusFromCasoStatus,
}: CasoResumoStatusActionsProps) {
  const { setValue } = useFormContext<{
    status: string;
    analiseStatus?: string;
    devAtribuido?: string;
    devAtribuidoLabel?: string;
  }>();
  const updateCaso = useUpdateCaso();

  const handleStatusChange = useCallback(
    (statusId: string) => {
      if (!getReportStatusFromCasoStatus) return;

      if (shouldClearReportAnaliseForCasoStatus(statusId)) {
        setValue("analiseStatus", "", {
          shouldDirty: false,
          shouldValidate: true,
        });
        return;
      }

      const reportStatus = getReportStatusFromCasoStatus(Number(statusId));
      if (reportStatus) {
        setValue("analiseStatus", reportStatus, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }

      if (
        deveAplicarDev631PorStatus({
          statusCaso: statusId,
          statusReport: reportStatus,
        })
      ) {
        applyDev631ToCasoEditForm(setValue as Dev631SetValue);
      }
    },
    [getReportStatusFromCasoStatus, setValue],
  );

  const proximoStatus = mapStatusAvancar(statusIdApi);
  const podeAvancar = proximoStatus != null;
  const exibirReverter = statusIdApi === 3;
  const exibirAvancar = statusIdApi !== 9;

  const buildStatusPayload = (status: number): UpdateCasoRequest => {
    if (shouldClearReportAnaliseForCasoStatus(status)) {
      return {
        status,
        report_analise_aprovado: false,
        report_analise_status: "0",
      };
    }

    const reportStatus = getReportStatusFromCasoStatus?.(status);
    if (!reportStatus) {
      return { status };
    }

    const analiseDataConclusao = buildAnaliseConclusaoByStatus(reportStatus);
    const deveForcarDev631 = reportStatus === "21" || status === 8;

    const deveLimparDataLimite = reportStatus === "21" || status === 8;

    return {
      status,
      ...(deveForcarDev631 ? { AtribuidoPara: 631 } : {}),
      report_analise_aprovado: true,
      report_analise_status: reportStatus,
      report_analise_data_conclusao: analiseDataConclusao,
      ...(deveLimparDataLimite ? { report_data_limite: null } : {}),
    };
  };

  const updateFormStatusValues = (status: number) => {
    setValue("status", String(status));
    if (shouldClearReportAnaliseForCasoStatus(status)) {
      setValue("analiseStatus", "");
      return;
    }
    const reportStatus = getReportStatusFromCasoStatus?.(status);
    if (reportStatus) {
      setValue("analiseStatus", reportStatus);
    }
    if (
      reportStatus &&
      deveAplicarDev631PorStatus({
        statusCaso: status,
        statusReport: reportStatus,
      })
    ) {
      applyDev631ToCasoEditForm(setValue as Dev631SetValue);
    }
  };

  const handleAvancarStatus = async () => {
    if (proximoStatus == null) {
      toast.error("Não há transição de status definida para o estado atual.");
      return;
    }
    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: buildStatusPayload(proximoStatus),
      });
      updateFormStatusValues(proximoStatus);
      toast.success("Status atualizado com sucesso.");
      onStatusUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar status.");
    }
  };

  const handleReverterStatus = async () => {
    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: buildStatusPayload(4),
      });
      updateFormStatusValues(4);
      toast.success("Status atualizado com sucesso.");
      onStatusUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar status.");
    }
  };

  const pending = updateCaso.isPending;

  return (
    <div className="flex flex-row gap-2 items-end">
      <div className="flex-1">
        <CasoFormStatus
          disabled={statusDisabled}
          onStatusChange={
            getReportStatusFromCasoStatus ? handleStatusChange : undefined
          }
        />
      </div>
      {/* {exibirReverter && (
        <Button
          type="button"
          variant="outline"
          className="h-9 w-10 shrink-0"
          onClick={handleReverterStatus}
          disabled={pending}
          aria-label="Reverter status"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )} */}
      {/* {exibirAvancar && (
        <Button
          type="button"
          variant="outline"
          className="h-9 w-10 shrink-0 bg-emerald-500 hover:bg-emerald-600/90 text-white hover:text-white"
          onClick={handleAvancarStatus}
          disabled={pending || !podeAvancar}
          aria-label="Avançar status"
        >
          <Check className="h-4 w-4" />
        </Button>
      )} */}
    </div>
  );
}
