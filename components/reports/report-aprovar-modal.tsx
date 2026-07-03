"use client";

import { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Sparkles, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";
import { importanceOptions } from "@/mocks/teste";
import { cn } from "@/lib/utils";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { AprovarReportParams } from "./use-report-acoes";
import { mapProjetoMemoriaToReportCard } from "./utils";
import { ReportModalInfoBlock } from "./report-modal-info-block";

interface ReportAprovarModalForm {
  produto: string;
  versao: string;
  projeto: string;
  devAtribuido: string;
  devAtribuidoLabel: string;
  modulo: string;
}

interface ReportAprovarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ProjetoMemoriaItem | null;
  onAprovar: (params: AprovarReportParams) => Promise<void>;
  isLoading?: boolean;
}

export function ReportAprovarModal({
  open,
  onOpenChange,
  item,
  onAprovar,
  isLoading = false,
}: ReportAprovarModalProps) {
  const methods = useForm<ReportAprovarModalForm>({
    defaultValues: {
      produto: "",
      versao: "",
      projeto: "",
      devAtribuido: "",
      devAtribuidoLabel: "",
      modulo: "",
    },
  });

  const produtoId = String(item?.produto?.id ?? "");
  const reportData = useMemo(
    () => (item ? mapProjetoMemoriaToReportCard(item) : null),
    [item],
  );

  useEffect(() => {
    if (!open) return;
    methods.reset({
      produto: produtoId,
      versao: "",
      projeto: "",
      devAtribuido: "",
      devAtribuidoLabel: "",
      modulo: "",
    });
  }, [open, produtoId, methods]);

  const produtoWatch = methods.watch("produto");

  const { data: versoes } = useVersoes({
    produto_id: produtoWatch,
    enabled: Boolean(produtoWatch) && open,
    todas: false,
  });

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: produtoWatch,
      isDisabled: isLoading,
      lazyLoadComboboxOptions: true as const,
      editCaseItem: item,
    }),
    [methods, produtoWatch, isLoading, item],
  );

  const handleConfirmar = methods.handleSubmit(async (values) => {
    if (!item) return;

    const versaoLabel = resolveVersaoProdutoForApi(values.versao, versoes);
    if (!versaoLabel.trim()) {
      toast.error("Selecione a versão do produto.");
      return;
    }
    if (!String(values.projeto).trim()) {
      toast.error("Selecione o projeto.");
      return;
    }
    if (!String(values.devAtribuido).trim()) {
      toast.error("Selecione o dev atribuído.");
      return;
    }

    await onAprovar({
      id: item.caso.id,
      versaoLabel,
      projetoId: values.projeto,
      devId: values.devAtribuido,
      modulo: values.modulo,
      statusCasoAtual: Number(item.caso.status?.status_id ?? 0),
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Aprovar report</DialogTitle>
      <DialogContent className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 gap-0 overflow-y-auto overflow-x-hidden border-border-divider p-0 sm:rounded-2xl">
        <div className="min-w-0 bg-card p-6">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-text-primary">
                Aprovar report
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Informe a versão, projeto e desenvolvedor para aprovar este
                report.
              </p>
            </div>
          </div>

          {reportData ? (
            <div className="mt-5">
              <ReportModalInfoBlock data={reportData} />
            </div>
          ) : null}

          <FormProvider {...methods}>
            <CasoFormProvider value={providerValue}>
              <div className="mt-5 min-w-0 space-y-4">
                <CasoFormVersao todas={false} />
                <CasoFormProjeto />
                <CasoFormDevAtribuido />
                <CasoFormModulo required={false} />
              </div>
            </CasoFormProvider>
          </FormProvider>

          <div className="mt-2 flex items-center justify-end gap-3 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={isLoading}
              className={cn("flex-1")}
            >
              {isLoading ? (
                <>
                  <Loader2 className=" h-3.5 w-3.5 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <Check className=" h-3.5 w-3.5" />
                  Aprovar report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
