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
import { Textarea } from "@/components/ui/textarea";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { PRODUTO_FORM_DIALOG_CLASS } from "@/components/produtos/dialog-classes";
import { cn } from "@/lib/utils";
import {
  getScriptFormDefaultValues,
  scriptFormSchema,
  type ScriptFormData,
} from "@/components/produtos/edicao/scripts/script-form-schema";
import {
  buildCreateScriptPayload,
  buildUpdateScriptPayload,
  scriptToFormValues,
} from "@/components/produtos/edicao/scripts/script-form-utils";
import { useCreateProdutoScript } from "@/hooks/produtos/use-create-produto-script";
import { useUpdateProdutoScript } from "@/hooks/produtos/use-update-produto-script";
import type { ProdutoScriptData } from "@/services/produtos/types";

const FORM_ID = "script-form";

export interface ScriptFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoId: number;
  script?: ProdutoScriptData | null;
}

export function ScriptFormModal({
  open,
  onOpenChange,
  produtoId,
  script = null,
}: ScriptFormModalProps) {
  const isEdit = script != null;
  const createScript = useCreateProdutoScript();
  const updateScript = useUpdateProdutoScript();
  const isSaving = createScript.isPending || updateScript.isPending;

  const methods = useForm<ScriptFormData>({
    resolver: zodResolver(scriptFormSchema),
    defaultValues: getScriptFormDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;
    methods.reset(
      isEdit && script
        ? scriptToFormValues(script)
        : getScriptFormDefaultValues(),
    );
  }, [open, isEdit, script, methods.reset]);

  function handleClose(next: boolean) {
    if (!next) methods.reset(getScriptFormDefaultValues());
    onOpenChange(next);
  }

  async function onSubmit(data: ScriptFormData) {
    try {
      if (isEdit && script) {
        await updateScript.mutateAsync({
          produtoId,
          scriptId: script.id,
          data: buildUpdateScriptPayload(data, script),
        });
      } else {
        await createScript.mutateAsync({
          produtoId,
          data: buildCreateScriptPayload(data),
        });
      }
      toast.success(PRODUTO_LABELS.scriptSalvo);
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : PRODUTO_LABELS.erroSalvarScript,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(PRODUTO_FORM_DIALOG_CLASS, "sm:max-w-3xl")}>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? PRODUTO_LABELS.editarScriptTitulo
              : PRODUTO_LABELS.novoScriptTitulo}
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
                {PRODUTO_LABELS.scriptTitulo}{" "}
                <span className="text-text-error">*</span>
              </Label>
              {methods.formState.errors.titulo ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.titulo.message}
                </p>
              ) : null}
              <Input
                placeholder={PRODUTO_LABELS.scriptTituloPlaceholder}
                className="h-9 rounded-lg border-border-input"
                disabled={isSaving}
                {...methods.register("titulo")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                {PRODUTO_LABELS.scriptOrdem}
              </Label>
              {methods.formState.errors.ordem ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.ordem.message}
                </p>
              ) : null}
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="h-9 rounded-lg border-border-input"
                disabled={isSaving}
                {...methods.register("ordem")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                {PRODUTO_LABELS.procedimento}{" "}
                <span className="text-text-error">*</span>
              </Label>
              {methods.formState.errors.procedimento ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.procedimento.message}
                </p>
              ) : null}
              <Textarea
                rows={12}
                placeholder={PRODUTO_LABELS.procedimentoPlaceholder}
                className="min-h-64 resize-y rounded-lg border-border-input font-mono text-sm"
                disabled={isSaving}
                {...methods.register("procedimento")}
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
