"use client";

import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { PRODUTO_FORM_DIALOG_CLASS } from "@/components/produtos/dialog-classes";
import { cn } from "@/lib/utils";
import {
  getModuloFormDefaultValues,
  moduloFormSchema,
  type ModuloFormData,
} from "@/components/produtos/edicao/modulos/modulo-form-schema";
import {
  buildCreateModuloPayload,
  buildUpdateModuloPayload,
  moduloToFormValues,
} from "@/components/produtos/edicao/modulos/modulo-form-utils";
import { useCreateProdutoModulo } from "@/hooks/produtos/use-create-produto-modulo";
import { useUpdateProdutoModulo } from "@/hooks/produtos/use-update-produto-modulo";
import type { ProdutoModuloData } from "@/services/produtos/types";

const FORM_ID = "modulo-form";

export interface ModuloFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoId: number;
  modulo?: ProdutoModuloData | null;
}

export function ModuloFormModal({
  open,
  onOpenChange,
  produtoId,
  modulo = null,
}: ModuloFormModalProps) {
  const isEdit = modulo != null;
  const createModulo = useCreateProdutoModulo();
  const updateModulo = useUpdateProdutoModulo();
  const isSaving = createModulo.isPending || updateModulo.isPending;

  const methods = useForm<ModuloFormData>({
    resolver: zodResolver(moduloFormSchema),
    defaultValues: getModuloFormDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;
    methods.reset(
      isEdit && modulo
        ? moduloToFormValues(modulo)
        : getModuloFormDefaultValues(),
    );
  }, [open, isEdit, modulo, methods.reset]);

  function handleClose(next: boolean) {
    if (!next) methods.reset(getModuloFormDefaultValues());
    onOpenChange(next);
  }

  async function onSubmit(data: ModuloFormData) {
    try {
      if (isEdit && modulo) {
        await updateModulo.mutateAsync({
          produtoId,
          sequencia: modulo.Sequencia,
          data: buildUpdateModuloPayload(data, modulo),
        });
      } else {
        await createModulo.mutateAsync({
          produtoId,
          data: buildCreateModuloPayload(data),
        });
      }
      toast.success(PRODUTO_LABELS.moduloSalvo);
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroSalvarModulo,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(PRODUTO_FORM_DIALOG_CLASS, "sm:max-w-xl")}>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? PRODUTO_LABELS.editarModuloTitulo
              : PRODUTO_LABELS.novoModuloTitulo}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            id={FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit, () => {
              toast.error(PRODUTO_LABELS.reviseDestacados);
            })}
            className="flex flex-col gap-4"
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                {PRODUTO_LABELS.nomeModulo}{" "}
                <span className="text-text-error">*</span>
              </Label>
              {methods.formState.errors.nome ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.nome.message}
                </p>
              ) : (
                <p className="text-xs text-text-secondary">
                  {PRODUTO_LABELS.nomeModuloHint}
                </p>
              )}
              <Input
                placeholder={PRODUTO_LABELS.nomeModuloPlaceholder}
                className="h-9 rounded-lg border-border-input uppercase"
                disabled={isSaving}
                {...methods.register("nome")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                {PRODUTO_LABELS.ordemImpressao}
              </Label>
              {methods.formState.errors.ordemImpressao ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.ordemImpressao.message}
                </p>
              ) : null}
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="h-9 rounded-lg border-border-input"
                disabled={isSaving}
                {...methods.register("ordemImpressao")}
              />
            </div>
          </form>
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
