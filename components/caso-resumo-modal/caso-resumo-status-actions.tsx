"use client";

import { Check, RotateCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import { CasoFormStatus } from "@/components/caso-form";
import { Button } from "@/components/ui/button";
import { useUpdateCaso } from "@/hooks/use-update-caso";
import { mapStatusAvancar } from "@/components/caso-resumo-modal/utils";

interface CasoResumoStatusActionsProps {
  statusIdApi: number;
  memoriaQueryId: string;
  onStatusUpdated: () => void;
}

export function CasoResumoStatusActions({
  statusIdApi,
  memoriaQueryId,
  onStatusUpdated,
}: CasoResumoStatusActionsProps) {
  const { setValue } = useFormContext<{ status: string }>();
  const updateCaso = useUpdateCaso();

  const proximoStatus = mapStatusAvancar(statusIdApi);
  const podeAvancar = proximoStatus != null;
  const exibirReverter = statusIdApi === 3;
  const exibirAvancar = statusIdApi !== 9;

  const handleAvancarStatus = async () => {
    if (proximoStatus == null) {
      toast.error("Não há transição de status definida para o estado atual.");
      return;
    }
    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: { status: proximoStatus },
      });
      setValue("status", String(proximoStatus));
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
        data: { status: 4 },
      });
      setValue("status", "4");
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
        <CasoFormStatus disabled={true} />
      </div>
      {exibirReverter && (
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
      )}
      {exibirAvancar && (
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
      )}
    </div>
  );
}
