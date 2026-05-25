"use client";

import { useEffect, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
import { useCreateSgpRiscoHistorico } from "@/hooks/projetos/use-create-sgp-risco-historico";
import { useUpdateSgpRiscoHistorico } from "@/hooks/projetos/use-update-sgp-risco-historico";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import type { SgpRiscoHistoricoItem } from "@/interfaces/sgp-risco-historico";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { RiscoHistoricoRiscoSelect } from "@/components/projetos/edicao/risco/risco-historico-risco-select";
import {
  buildCreateSgpRiscoHistoricoPayload,
  buildUpdateSgpRiscoHistoricoPayload,
  historicoToFormValues,
  riscoPadraoToFormValues,
} from "@/components/projetos/edicao/risco/risco-historico-form-utils";
import {
  riscoHistoricoFormDefaultValues,
  riscoHistoricoFormSchema,
  type RiscoHistoricoFormValues,
} from "@/components/projetos/edicao/risco/risco-historico-form-schema";

const FORM_CONTROL_CLASS = "h-9 rounded-lg border-border-input";

export interface RiscoHistoricoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  riscos: SgpRiscoItem[];
  riscoPadrao?: SgpRiscoItem | null;
  ocorrencia?: SgpRiscoHistoricoItem | null;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-text-label">
      {children}
    </Label>
  );
}

export function RiscoHistoricoFormModal({
  open,
  onOpenChange,
  mode,
  riscos,
  riscoPadrao = null,
  ocorrencia = null,
}: RiscoHistoricoFormModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const isEditMode = mode === "edit";
  const lockRiscoSelect = !isEditMode && !!riscoPadrao;

  const form = useForm<RiscoHistoricoFormValues>({
    resolver: zodResolver(riscoHistoricoFormSchema),
    defaultValues: riscoHistoricoFormDefaultValues,
  });

  const createHistorico = useCreateSgpRiscoHistorico();
  const updateHistorico = useUpdateSgpRiscoHistorico();
  const isSubmitting = createHistorico.isPending || updateHistorico.isPending;

  useEffect(() => {
    if (!open) return;
    if (isEditMode && ocorrencia) {
      form.reset(historicoToFormValues(ocorrencia));
    } else if (riscoPadrao) {
      form.reset({
        ...riscoHistoricoFormDefaultValues,
        ...riscoPadraoToFormValues(riscoPadrao),
      });
    } else {
      form.reset(riscoHistoricoFormDefaultValues);
    }
  }, [open, isEditMode, ocorrencia, riscoPadrao, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(riscoHistoricoFormDefaultValues);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && ocorrencia?.id) {
        const response = await updateHistorico.mutateAsync({
          id: ocorrencia.id,
          data: buildUpdateSgpRiscoHistoricoPayload(values),
        });
        toast.success(response.message ?? "Ocorrência atualizada com sucesso.");
      } else {
        const response = await createHistorico.mutateAsync(
          buildCreateSgpRiscoHistoricoPayload(values),
        );
        toast.success(response.message ?? "Ocorrência cadastrada com sucesso.");
      }
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Erro ao atualizar ocorrência."
            : "Erro ao cadastrar ocorrência.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Editar ocorrência" : "Adicionar ocorrência"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Registre um evento relacionado ao risco selecionado
          </p>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              onSubmit(e);
            }}
            className="space-y-3 px-6 pb-6 pt-6"
          >
            <RiscoHistoricoRiscoSelect
              riscos={riscos}
              disabled={!canEdit || isSubmitting || lockRiscoSelect}
              required
            />

            <DatePickerInput
              label="Data da ocorrência"
              required
              value={form.watch("dataHistorico")}
              onChange={(date) => {
                if (date) {
                  form.setValue("dataHistorico", date, {
                    shouldValidate: true,
                  });
                }
              }}
              placeholder="dd/mm/aaaa"
              disabled={!canEdit || isSubmitting}
              controlHeightClassName={FORM_CONTROL_CLASS}
            />
            {form.formState.errors.dataHistorico && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dataHistorico.message}
              </p>
            )}

            <div className="space-y-2">
              <FieldLabel htmlFor="ocorrencia-descricao">Descrição</FieldLabel>
              <Textarea
                id="ocorrencia-descricao"
                placeholder="Descreva o que aconteceu..."
                className="min-h-[80px] resize-none rounded-lg border-border-input"
                disabled={!canEdit || isSubmitting}
                {...form.register("descricao")}
              />
              {form.formState.errors.descricao && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.descricao.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="ocorrencia-impacto">
                Impacto gerado
              </FieldLabel>
              <Textarea
                id="ocorrencia-impacto"
                placeholder="Qual foi o impacto gerado?"
                className="min-h-[80px] resize-none rounded-lg border-border-input"
                disabled={!canEdit || isSubmitting}
                {...form.register("impacto")}
              />
              {form.formState.errors.impacto && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.impacto.message}
                </p>
              )}
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
                    {isEditMode ? "Salvando..." : "Adicionando..."}
                  </>
                ) : isEditMode ? (
                  "Salvar alterações"
                ) : (
                  "Adicionar ocorrência"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
