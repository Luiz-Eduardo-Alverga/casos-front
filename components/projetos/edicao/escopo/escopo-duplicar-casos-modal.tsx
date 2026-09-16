"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus, Info } from "lucide-react";
import toast from "react-hot-toast";

import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { importanceOptions } from "@/mocks/teste";
import {
  escopoDuplicarCasosDefaultValues,
  escopoDuplicarCasosSchema,
  type EscopoDuplicarCasosFormValues,
} from "@/components/projetos/edicao/escopo/escopo-duplicar-casos-schema";

interface EscopoDuplicarCasosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronogramaOrigem: number | string;
  setorProjeto?: string;
  isSubmitting?: boolean;
  onConfirm: (cronogramaDestino: number) => Promise<void> | void;
}

export function EscopoDuplicarCasosModal({
  open,
  onOpenChange,
  cronogramaOrigem,
  setorProjeto,
  isSubmitting = false,
  onConfirm,
}: EscopoDuplicarCasosModalProps) {
  const form = useForm<EscopoDuplicarCasosFormValues>({
    resolver: zodResolver(escopoDuplicarCasosSchema),
    defaultValues: escopoDuplicarCasosDefaultValues,
  });

  const providerValue = useMemo(
    () => ({
      form,
      importanceOptions,
      produto: "",
      isDisabled: isSubmitting,
      lazyLoadComboboxOptions: true as const,
    }),
    [form, isSubmitting],
  );

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      form.reset(escopoDuplicarCasosDefaultValues);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = form.handleSubmit(async (values) => {
    const cronogramaDestino = Number(values.projeto);
    if (!Number.isFinite(cronogramaDestino) || cronogramaDestino <= 0) {
      toast.error("Selecione o projeto destino.");
      return;
    }

    if (String(cronogramaDestino) === String(cronogramaOrigem)) {
      toast.error("Selecione um projeto destino diferente do atual.");
      return;
    }

    await onConfirm(cronogramaDestino);
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-[520px] min-w-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Duplicar casos</DialogTitle>

        <FormProvider {...form}>
          <CasoFormProvider value={providerValue}>
            <div className="bg-card flex flex-col rounded-lg">
              <div className="border-b border-border-divider px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                    <CopyPlus className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-text-primary">
                      Duplicar casos
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Selecione o projeto destino para duplicar os casos
                      elegíveis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 pb-6 pt-4">
                <CasoFormProjeto
                  required
                  requireProduto={false}
                  requireSetorProjeto
                  setorProjeto={setorProjeto}
                  autoSelectProjeto="never"
                />

                <div className="rounded-lg border border-border-divider bg-muted/40 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Os casos em Aberto e Em desenvolvimento deste projeto
                      serão duplicados no projeto destino. A marcação Não
                      planejado será removida nos casos gerados. Casos
                      bloqueados não entram nessa operação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-divider px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                    onClick={handleConfirm}
                  >
                    <CopyPlus className="mr-2 size-4" />
                    {isSubmitting ? "Duplicando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            </div>
          </CasoFormProvider>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
