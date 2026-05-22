"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { useUpdateSgpCronograma } from "@/hooks/projetos/use-update-sgp-cronograma";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { parseSgpDateToDate } from "@/components/projetos/cadastro/utils";
import { buildConcluirSgpCronogramaPayload } from "@/components/projetos/edicao/cronograma/cronograma-form-utils";
import {
  cronogramaConcluirDefaultValues,
  cronogramaConcluirSchema,
  type CronogramaConcluirFormValues,
} from "@/components/projetos/edicao/cronograma/cronograma-concluir-schema";

const FORM_CONTROL_CLASS = "h-9 rounded-lg border-border-input";

function getDefaultDataRealizacao(item: SgpCronogramaItem | null): Date {
  const fromItem = item ? parseSgpDateToDate(item.hora_realizada) : undefined;
  return fromItem ?? new Date();
}

export interface CronogramaConcluirModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: number | string;
  tarefa: SgpCronogramaItem | null;
}

export function CronogramaConcluirModal({
  open,
  onOpenChange,
  projetoId,
  tarefa,
}: CronogramaConcluirModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  const form = useForm<CronogramaConcluirFormValues>({
    resolver: zodResolver(cronogramaConcluirSchema),
    defaultValues: cronogramaConcluirDefaultValues,
  });

  const updateCronograma = useUpdateSgpCronograma({ projetoId });
  const isSubmitting = updateCronograma.isPending;

  useEffect(() => {
    if (!open || !tarefa) return;
    form.reset({
      dataRealizacao: getDefaultDataRealizacao(tarefa),
      observacao: tarefa.observacao?.trim() ?? "",
    });
  }, [open, tarefa, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(cronogramaConcluirDefaultValues);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }
    if (!tarefa?.sequencia) {
      toast.error("Tarefa inválida para conclusão.");
      return;
    }

    try {
      const payload = buildConcluirSgpCronogramaPayload(
        tarefa,
        values.dataRealizacao,
        values.observacao ?? "",
      );
      const response = await updateCronograma.mutateAsync({
        sequencia: tarefa.sequencia,
        data: payload,
      });
      toast.success(
        response.message ?? "Tarefa concluída com sucesso.",
      );
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao concluir tarefa.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Concluir Tarefa
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Informe a data de realização para marcar a tarefa como concluída
          </p>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            onSubmit(e);
          }}
          className="space-y-6 px-6 pb-6 pt-6"
        >
          <div className="space-y-3">
            <DatePickerInput
              label="Data de realização"
              required
              value={form.watch("dataRealizacao")}
              onChange={(date) =>
                form.setValue("dataRealizacao", date as Date, {
                  shouldValidate: true,
                })
              }
              placeholder="dd/mm/aaaa"
              disabled={!canEdit || isSubmitting}
              controlHeightClassName={FORM_CONTROL_CLASS}
            />
            {form.formState.errors.dataRealizacao && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dataRealizacao.message}
              </p>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="cronograma-concluir-observacao"
                className="text-sm font-medium text-text-label"
              >
                Observações
              </Label>
              <Textarea
                id="cronograma-concluir-observacao"
                placeholder="Observações sobre esse status"
                className="min-h-[80px] resize-none rounded-lg border-border-input"
                disabled={!canEdit || isSubmitting}
                {...form.register("observacao")}
              />
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-[38px] rounded-lg border-border"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-[38px] rounded-lg"
              disabled={!canEdit || isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
