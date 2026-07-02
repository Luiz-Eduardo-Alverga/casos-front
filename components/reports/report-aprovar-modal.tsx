"use client";

import { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Sparkles, X, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";
import { importanceOptions } from "@/mocks/teste";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { AprovarReportParams } from "./use-report-acoes";

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
      <DialogContent className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 overflow-y-auto overflow-x-hidden p-0">
        <div className="min-w-0 rounded-lg border border-border-divider bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 border-b border-border-divider pb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-xl font-semibold text-text-primary">
              Aprovar Report
            </h3>
          </div>

          <FormProvider {...methods}>
            <CasoFormProvider value={providerValue}>
              <div className="min-w-0 space-y-4 py-5">
                <CasoFormVersao todas={false} />
                <CasoFormProjeto />
                <CasoFormDevAtribuido />
                <CasoFormModulo required={false} />
              </div>
            </CasoFormProvider>
          </FormProvider>

          <div className="flex min-w-0 w-full gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Aprovar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
