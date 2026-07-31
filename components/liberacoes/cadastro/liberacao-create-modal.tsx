"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Layers, Loader2, PackageSearch, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { produtosToOptions } from "@/components/liberacoes/utils";
import { TIPO_LIBERACAO_OPTIONS } from "@/components/liberacoes/constants";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";
import { useCreateLiberacao } from "@/hooks/liberacoes/use-create-liberacao";
import {
  LIBERACAO_CREATE_DEFAULT_VALUES,
  liberacaoCreateFormSchema,
  type LiberacaoCreateFormData,
} from "@/components/liberacoes/cadastro/schema";
import { buildCreateLiberacaoPayload } from "@/components/liberacoes/cadastro/utils";

export interface LiberacaoCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (registro: number) => void;
}

const TIPO_OPTIONS = TIPO_LIBERACAO_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export function LiberacaoCreateModal({
  open,
  onOpenChange,
  onCreated,
}: LiberacaoCreateModalProps) {
  const { data: produtos, isLoading: isProdutosLoading } = useProdutos({
    enabled: open,
  });
  const produtoOptions = useMemo(() => produtosToOptions(produtos), [produtos]);
  const createLiberacao = useCreateLiberacao();

  const methods = useForm<LiberacaoCreateFormData>({
    resolver: zodResolver(liberacaoCreateFormSchema),
    defaultValues: LIBERACAO_CREATE_DEFAULT_VALUES,
  });

  const produtoId = methods.watch("produtoId");
  const versaoSelecionada = methods.watch("versao");
  const versoesChips = methods.watch("versoes");

  const { data: versoesCatalog } = useVersoes({
    produto_id: produtoId,
    enabled: open && Boolean(produtoId),
  });

  useEffect(() => {
    if (open) methods.reset(LIBERACAO_CREATE_DEFAULT_VALUES);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset apenas ao abrir o modal
  }, [open]);

  useEffect(() => {
    methods.setValue("produto", produtoId ?? "");
    methods.setValue("versao", "");
  }, [produtoId, methods]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      produto: produtoId,
      isDisabled: methods.formState.isSubmitting || createLiberacao.isPending,
    }),
    [methods, produtoId, createLiberacao.isPending],
  );

  const handleClose = (next: boolean) => {
    if (!next) methods.reset(LIBERACAO_CREATE_DEFAULT_VALUES);
    onOpenChange(next);
  };

  const isSubmitting =
    methods.formState.isSubmitting || createLiberacao.isPending;

  const handleAddVersao = () => {
    const sequencia = methods.getValues("versao");
    const texto = resolveVersaoProdutoForApi(sequencia ?? "", versoesCatalog);
    if (!texto) return;

    const atuais = methods.getValues("versoes");
    if (atuais.includes(texto)) {
      toast.error("Esta versão já foi adicionada.");
      return;
    }

    methods.setValue("versoes", [...atuais, texto], { shouldValidate: true });
    methods.setValue("versao", "");
  };

  const handleRemoveVersao = (versao: string) => {
    methods.setValue(
      "versoes",
      methods.getValues("versoes").filter((v) => v !== versao),
      { shouldValidate: true },
    );
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const payload = buildCreateLiberacaoPayload(data);
      const response = await createLiberacao.mutateAsync(payload);
      toast.success(`Liberação #${response.data.registro} criada com sucesso.`);
      handleClose(false);
      onCreated(response.data.registro);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar liberação.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Nova liberação
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os campos abaixo para criar um novo registro de liberação
          </p>
        </DialogHeader>

        <FormProvider {...methods}>
          <CasoFormProvider value={providerValue}>
            <form
              onSubmit={(e) => {
                e.stopPropagation();
                void onSubmit(e);
              }}
              className="max-h-[70vh] space-y-4 overflow-y-auto px-6 pb-6 pt-6"
            >
              <ComboboxField
                name="produtoId"
                label="Produto"
                icon={PackageSearch}
                options={produtoOptions}
                placeholder="Selecione o produto..."
                emptyText="Nenhum produto encontrado."
                isLoading={isProdutosLoading}
                required
                disabled={isSubmitting}
                controlHeightClassName="h-9"
              />

              <div className="grid grid-cols-2 items-end gap-4">
                <ComboboxField
                  name="tipoLiberacao"
                  label="Tipo de liberação"
                  icon={Layers}
                  options={TIPO_OPTIONS}
                  placeholder="Selecione o tipo..."
                  emptyText="Nenhum tipo encontrado."
                  disabled={isSubmitting}
                  controlHeightClassName="h-9"
                />

                <Controller
                  control={methods.control}
                  name="versaoFinalDataPrevista"
                  render={({ field }) => (
                    <DatePickerInput
                      label="Previsão da versão final"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      controlHeightClassName="h-9"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Observação
                </Label>
                <Textarea
                  placeholder="Escopo, contexto ou notas sobre esta liberação..."
                  className="min-h-[80px] resize-none rounded-lg border-border-input"
                  disabled={isSubmitting}
                  {...methods.register("observacao")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  {/* <Label className="text-sm font-medium text-text-label">
                    Versões iniciais <span className="text-destructive">*</span>
                  </Label> */}
                  {methods.formState.errors.versoes && (
                    <p className="text-sm text-destructive">
                      {methods.formState.errors.versoes.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <CasoFormVersao required={false} />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddVersao}
                    disabled={
                      !versaoSelecionada?.trim() || !produtoId || isSubmitting
                    }
                    className="h-9 shrink-0 px-3"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                {versoesChips.length > 0 ? (
                  <div className="space-y-2">
                    {versoesChips.map((versao) => (
                      <div
                        key={versao}
                        className="flex items-center justify-between rounded-lg border border-border-divider px-3 py-2"
                      >
                        <span className="font-mono text-sm font-semibold text-text-primary">
                          {versao}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-text-secondary hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveVersao(versao)}
                          disabled={isSubmitting}
                          aria-label={`Remover versão ${versao}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary">
                    Selecione o produto e adicione ao menos uma versão.
                  </p>
                )}
              </div>

              <DialogFooter className="grid grid-cols-2 gap-2 pt-2 sm:space-x-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Criar liberação"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </CasoFormProvider>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
