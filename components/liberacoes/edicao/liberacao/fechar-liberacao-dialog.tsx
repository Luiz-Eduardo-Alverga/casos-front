"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { useFecharLiberacao } from "@/hooks/liberacoes/use-fechar-liberacao";
import { formatLiberacaoDateApi } from "@/components/liberacoes/utils";

export interface FecharLiberacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: number;
}

export function FecharLiberacaoDialog({
  open,
  onOpenChange,
  registro,
}: FecharLiberacaoDialogProps) {
  const [data, setData] = useState<Date | undefined>(undefined);
  const fecharLiberacao = useFecharLiberacao();

  const handleClose = (next: boolean) => {
    if (!next) setData(undefined);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    const versaoFinalDataLiberacao = formatLiberacaoDateApi(data);
    if (!versaoFinalDataLiberacao) {
      toast.error("Informe a data de liberação da versão final.");
      return;
    }
    try {
      await fecharLiberacao.mutateAsync({
        registro,
        data: {
          status: "FECHADO",
          versao_final_data_liberacao: versaoFinalDataLiberacao,
        },
      });
      toast.success("Liberação concluída com sucesso.");
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao concluir liberação.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-left">
              <DialogTitle>Concluir liberação</DialogTitle>
              <p className="text-sm text-text-secondary">
                Após concluída, os campos de datas e versões ficam somente
                leitura. Essa ação não pode ser desfeita pela tela.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <DatePickerInput
            label="Data de liberação da versão final"
            required
            value={data}
            onChange={setData}
            controlHeightClassName="h-9"
          />
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={fecharLiberacao.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={handleConfirm}
            disabled={!data || fecharLiberacao.isPending}
          >
            {fecharLiberacao.isPending ? "Aguarde..." : "Confirmar conclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
