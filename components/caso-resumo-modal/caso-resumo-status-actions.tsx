"use client";

import { Check, RotateCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import { CasoFormStatus } from "@/components/fields/caso-form-status";
import { Button } from "@/components/ui/button";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { mapStatusAvancar } from "@/components/caso-resumo-modal/utils";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import { buildAnaliseConclusaoByStatus } from "@/components/casos/edicao/report-analise-modal/utils";

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
  }>();
  const updateCaso = useUpdateCaso();

  const proximoStatus = mapStatusAvancar(statusIdApi);
  const podeAvancar = proximoStatus != null;
  const exibirReverter = statusIdApi === 3;
  const exibirAvancar = statusIdApi !== 9;

  const buildStatusPayload = (status: number): UpdateCasoRequest => {
    const reportStatus = getReportStatusFromCasoStatus?.(status);
    if (!reportStatus) {
      return { status };
    }

    const analiseDataConclusao = buildAnaliseConclusaoByStatus(reportStatus);

    return {
      status,
      report_analise_aprovado: true,
      report_analise_status: reportStatus,
      report_analise_data_conclusao: analiseDataConclusao,
      report_data_limite: reportStatus === "21" ? null : analiseDataConclusao,
    };
  };

  const updateFormStatusValues = (status: number) => {
    setValue("status", String(status));
    const reportStatus = getReportStatusFromCasoStatus?.(status);
    if (reportStatus) {
      setValue("analiseStatus", reportStatus);
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
        <CasoFormStatus disabled={statusDisabled} />
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
