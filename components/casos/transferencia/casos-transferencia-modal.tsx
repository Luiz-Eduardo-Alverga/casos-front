"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeftRight, Info } from "lucide-react";

import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { importanceOptions } from "@/mocks/teste";
import type { CasosTransferenciaFormValues } from "./types";

interface CasosTransferenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalSelecionados: number;
  produtoIdPadrao?: string;
  isSubmitting?: boolean;
  onSubmit: (values: CasosTransferenciaFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: CasosTransferenciaFormValues = {
  devAtribuido: "",
  qaAtribuido: "",
  versao: "",
  importancia: "",
  projeto: "",
  duplicarCasos: false,
};

export function CasosTransferenciaModal({
  open,
  onOpenChange,
  totalSelecionados,
  produtoIdPadrao,
  isSubmitting = false,
  onSubmit,
}: CasosTransferenciaModalProps) {
  const form = useForm<CasosTransferenciaFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const providerValue = useMemo(
    () => ({
      form,
      importanceOptions,
      produto: String(produtoIdPadrao ?? ""),
      isDisabled: false,
      lazyLoadComboboxOptions: true as const,
    }),
    [form, produtoIdPadrao],
  );

  const handleConfirm = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      form.reset(DEFAULT_VALUES);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-[660px] min-w-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Transferir casos</DialogTitle>

        <FormProvider {...form}>
          <CasoFormProvider value={providerValue}>
            <div className="bg-card rounded-lg flex flex-col">
              <div className="border-b border-border-divider px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-foreground text-background flex items-center justify-center shadow-sm">
                      <ArrowLeftRight className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-text-primary">
                          Transferir Casos
                        </h3>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {totalSelecionados} casos
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Configure os parâmetros de transferência e destino dos
                        casos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="rounded-lg border border-border-divider bg-muted/40 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Os campos não preenchidos manterão os valores atuais dos
                      casos. Preencha apenas o que deseja alterar.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CasoFormDevAtribuido
                    required={false}
                    requireProduto={false}
                    label="Desenvolvedor Responsável"
                    placeholder="Selecione..."
                    name="devAtribuido"
                  />
                  <CasoFormQaAtribuido
                    required={false}
                    requireProduto={false}
                    label="Analista de Qualidade (QA)"
                    placeholder="Selecione..."
                    name="qaAtribuido"
                  />
                  <CasoFormVersao required={false} />
                  <CasoFormImportancia tipo="CASO" required={false} />
                </div>

                <CasoFormProjeto required={false} requireProduto={false} />

                {/* <div className="rounded-lg border border-border-divider bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="duplicar-casos"
                        className="text-xs font-semibold text-text-primary"
                      >
                        Duplicar casos ao inves de transferir
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Os casos originais serão mantidos e cópias serão criadas
                        no destino.
                      </p>
                    </div>
                    <Checkbox
                      id="duplicar-casos"
                      checked={Boolean(form.watch("duplicarCasos"))}
                      onCheckedChange={(checked) =>
                        form.setValue("duplicarCasos", Boolean(checked))
                      }
                      className={cn(
                        "h-5 w-9 rounded-full data-[state=checked]:bg-foreground",
                        "data-[state=checked]:text-background",
                      )}
                    />
                  </div>
                </div> */}
              </div>

              <div className="border-t border-border-divider px-6 py-4">
                <div className="flex items-center justify-end gap-3">
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
                    className="bg-foreground text-background hover:bg-foreground/90 flex-1"
                    disabled={isSubmitting}
                    onClick={handleConfirm}
                  >
                    <ArrowLeftRight className="mr-2 size-3.5" />
                    {isSubmitting ? "Transferindo..." : "Transferir"}
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
