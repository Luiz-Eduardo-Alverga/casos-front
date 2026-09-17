"use client";

import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
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
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SwitchChoiceCard } from "@/components/ui/switch-choice-card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { PRODUTO_FORM_DIALOG_CLASS } from "@/components/produtos/dialog-classes";
import { cn } from "@/lib/utils";
import { formatProdutoData } from "@/components/produtos/utils";
import { colaboradorLabelById } from "@/components/produtos/cadastro/utils";
import {
  getVersaoFormDefaultValues,
  versaoFormSchema,
  type VersaoFormData,
} from "@/components/produtos/edicao/versoes/versao-form-schema";
import {
  isoToLocalDate,
  localDateToIso,
} from "@/components/produtos/edicao/versoes/utils";
import {
  buildCreateVersaoPayload,
  buildUpdateVersaoPayload,
  versaoToFormValues,
} from "@/components/produtos/edicao/versoes/versao-form-utils";
import { useCreateProdutoVersao } from "@/hooks/produtos/use-create-produto-versao";
import { useUpdateProdutoVersao } from "@/hooks/produtos/use-update-produto-versao";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { getUser } from "@/lib/auth";
import type { ProdutoVersaoData } from "@/services/produtos/types";

const FORM_ID = "versao-form";

export interface VersaoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoId: number;
  versao?: ProdutoVersaoData | null;
}

export function VersaoFormModal({
  open,
  onOpenChange,
  produtoId,
  versao = null,
}: VersaoFormModalProps) {
  const isEdit = versao != null;
  const user = useMemo(() => getUser(), []);
  const { data: usuarios } = useRelatores({ enabled: open });
  const createVersao = useCreateProdutoVersao();
  const updateVersao = useUpdateProdutoVersao();
  const isSaving = createVersao.isPending || updateVersao.isPending;

  const methods = useForm<VersaoFormData>({
    resolver: zodResolver(versaoFormSchema),
    defaultValues: getVersaoFormDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;
    methods.reset(
      isEdit && versao ? versaoToFormValues(versao) : getVersaoFormDefaultValues(),
    );
  }, [open, isEdit, versao, methods.reset]);

  const status = useWatch({ control: methods.control, name: "status" });
  const fechamentoLabel =
    status === "FECHADO"
      ? PRODUTO_LABELS.dataFechamento
      : PRODUTO_LABELS.previsaoFechamento;

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      isDisabled: isSaving,
      lazyLoadComboboxOptions: true as const,
    }),
    [methods, isSaving],
  );

  function handleClose(next: boolean) {
    if (!next) methods.reset(getVersaoFormDefaultValues());
    onOpenChange(next);
  }

  async function onSubmit(data: VersaoFormData) {
    try {
      if (isEdit && versao) {
        await updateVersao.mutateAsync({
          produtoId,
          sequencia: versao.Sequencia,
          data: buildUpdateVersaoPayload(data, versao),
        });
      } else {
        await createVersao.mutateAsync({
          produtoId,
          data: buildCreateVersaoPayload(data),
        });
      }
      toast.success(PRODUTO_LABELS.versaoSalva);
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroSalvarVersao,
      );
    }
  }

  const testadorLabel =
    isEdit && versao?.testador_id
      ? colaboradorLabelById(versao.testador_id, usuarios, user)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(PRODUTO_FORM_DIALOG_CLASS, "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? PRODUTO_LABELS.editarVersaoTitulo
              : PRODUTO_LABELS.novaVersaoTitulo}
          </DialogTitle>
          {isEdit && versao ? (
            <p className="text-sm text-muted-foreground">
              {PRODUTO_LABELS.sequencia} #{versao.Sequencia}
            </p>
          ) : null}
        </DialogHeader>

        <FormProvider {...methods}>
          <CasoFormProvider value={providerValue}>
            <form
              id={FORM_ID}
              onSubmit={methods.handleSubmit(onSubmit, () => {
                toast.error(PRODUTO_LABELS.reviseDestacados);
              })}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text-label">
                    {PRODUTO_LABELS.versaoColuna}{" "}
                    <span className="text-text-error">*</span>
                  </Label>
                  {methods.formState.errors.versao ? (
                    <p className="text-sm text-destructive">
                      {methods.formState.errors.versao.message}
                    </p>
                  ) : null}
                  <Input
                    placeholder={PRODUTO_LABELS.versaoPlaceholder}
                    className="h-9 rounded-lg border-border-input font-mono"
                    disabled={isSaving}
                    {...methods.register("versao")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text-label">
                    {PRODUTO_LABELS.status}{" "}
                    <span className="text-text-error">*</span>
                  </Label>
                  <Controller
                    name="status"
                    control={methods.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="h-9 rounded-lg border-border-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ABERTO">
                            {PRODUTO_LABELS.statusAberto}
                          </SelectItem>
                          <SelectItem value="FECHADO">
                            {PRODUTO_LABELS.statusFechado}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="abertura"
                    control={methods.control}
                    render={({ field }) => (
                      <DatePickerInput
                        label={PRODUTO_LABELS.dataAbertura}
                        required
                        value={isoToLocalDate(field.value)}
                        onChange={(date) =>
                          field.onChange(localDateToIso(date))
                        }
                        placeholder="dd/mm/aaaa"
                        disabled={isSaving}
                        controlHeightClassName="h-9"
                      />
                    )}
                  />
                  {methods.formState.errors.abertura ? (
                    <p className="text-sm text-destructive">
                      {methods.formState.errors.abertura.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="fechamento"
                    control={methods.control}
                    render={({ field }) => (
                      <DatePickerInput
                        label={fechamentoLabel}
                        value={isoToLocalDate(field.value)}
                        onChange={(date) =>
                          field.onChange(localDateToIso(date))
                        }
                        placeholder="dd/mm/aaaa"
                        disabled={isSaving}
                        controlHeightClassName="h-9"
                      />
                    )}
                  />
                  {methods.formState.errors.fechamento ? (
                    <p className="text-sm text-destructive">
                      {methods.formState.errors.fechamento.message}
                    </p>
                  ) : null}
                </div>

                <CasoFormRelator
                  name="testadorId"
                  label={PRODUTO_LABELS.testador}
                  placeholder={PRODUTO_LABELS.colaboradorNenhum}
                  required={false}
                  selectedLabelOverride={testadorLabel}
                />

                {isEdit && versao ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-label">
                      {PRODUTO_LABELS.dataVersao}
                    </Label>
                    <Input
                      readOnly
                      disabled
                      className="h-9 rounded-lg border-border-input"
                      value={formatProdutoData(versao.DataVersao)}
                    />
                    <p className="text-xs text-text-secondary">
                      {PRODUTO_LABELS.geradosServidor}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  {PRODUTO_LABELS.notasVersao}
                </Label>
                <Textarea
                  placeholder={PRODUTO_LABELS.notasPlaceholder}
                  className="min-h-24 resize-y rounded-lg border-border-input"
                  disabled={isSaving}
                  {...methods.register("notas")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Controller
                  name="helptools"
                  control={methods.control}
                  render={({ field }) => (
                    <SwitchChoiceCard
                      id="versao-form-helptools"
                      title={PRODUTO_LABELS.helptools}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  )}
                />
                <Controller
                  name="estacionamentoIdeias"
                  control={methods.control}
                  render={({ field }) => (
                    <SwitchChoiceCard
                      id="versao-form-estacionamento"
                      title={PRODUTO_LABELS.estacionamentoIdeias}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  )}
                />
              </div>
            </form>
          </CasoFormProvider>
        </FormProvider>

        <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSaving}
          >
            {PRODUTO_LABELS.cancelar}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {PRODUTO_LABELS.salvando}
              </>
            ) : (
              PRODUTO_LABELS.salvar
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
