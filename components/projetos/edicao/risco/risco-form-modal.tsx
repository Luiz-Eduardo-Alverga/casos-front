"use client";

import { useEffect, useMemo, type ReactNode } from "react";
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
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSgpRiscoCadastro } from "@/components/fields/caso-form-sgp-risco-cadastro";
import { importanceOptions } from "@/mocks/teste";
import { useCreateSgpRisco } from "@/hooks/projetos/use-create-sgp-risco";
import { useUpdateSgpRisco } from "@/hooks/projetos/use-update-sgp-risco";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { RiscoFormNivelSelect } from "@/components/projetos/edicao/risco/risco-form-nivel-select";
import {
  buildCreateSgpRiscoPayload,
  buildUpdateSgpRiscoPayload,
  riscoToFormValues,
} from "@/components/projetos/edicao/risco/risco-form-utils";
import {
  riscoFormDefaultValues,
  riscoFormSchema,
  type RiscoFormValues,
} from "@/components/projetos/edicao/risco/risco-form-schema";

export interface RiscoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  projetoId: number | string;
  risco?: SgpRiscoItem | null;
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-text-label">
      {children}
    </Label>
  );
}

export function RiscoFormModal({
  open,
  onOpenChange,
  mode,
  projetoId,
  risco = null,
}: RiscoFormModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const isEditMode = mode === "edit";

  const form = useForm<RiscoFormValues>({
    resolver: zodResolver(riscoFormSchema),
    defaultValues: riscoFormDefaultValues,
  });

  const createRisco = useCreateSgpRisco({ projetoId });
  const updateRisco = useUpdateSgpRisco({ projetoId });
  const isSubmitting = createRisco.isPending || updateRisco.isPending;

  const casoFormProviderValue = useMemo(
    () => ({
      form,
      importanceOptions,
      produto: "1",
      isDisabled: !canEdit || isSubmitting,
      lazyLoadComboboxOptions: true as const,
    }),
    [form, canEdit, isSubmitting],
  );

  const riscoFallback = useMemo(() => {
    if (!isEditMode || !risco?.id_risco) return null;
    return {
      value: String(risco.id_risco),
      label: risco.descricao_risco?.trim() || `Risco ${risco.id_risco}`,
    };
  }, [isEditMode, risco]);

  useEffect(() => {
    if (!open) return;
    if (isEditMode && risco) {
      form.reset(riscoToFormValues(risco));
    } else {
      form.reset(riscoFormDefaultValues);
    }
  }, [open, isEditMode, risco, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(riscoFormDefaultValues);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }

    if (!values.idRiscoLabel?.trim() && !values.idRisco) {
      toast.error("Selecione um risco válido.");
      return;
    }

    try {
      if (isEditMode) {
        if (!risco?.sequencia) {
          toast.error("Risco inválido para edição.");
          return;
        }
        const payload = buildUpdateSgpRiscoPayload(values, projetoId, risco);
        const response = await updateRisco.mutateAsync({
          sequencia: risco.sequencia,
          data: payload,
        });
        toast.success(response.message ?? "Risco atualizado com sucesso.");
      } else {
        const payload = buildCreateSgpRiscoPayload(values, projetoId);
        const response = await createRisco.mutateAsync(payload);
        toast.success(response.message ?? "Risco cadastrado com sucesso.");
      }
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Erro ao atualizar risco."
            : "Erro ao cadastrar risco.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Editar Risco" : "Adicionar Risco"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Cadastre um risco potencial, seus impactos e planos de ação
          </p>
        </DialogHeader>

        <FormProvider {...form}>
          <CasoFormProvider value={casoFormProviderValue}>
            <form
              onSubmit={(e) => {
                e.stopPropagation();
                onSubmit(e);
              }}
              className="space-y-3 px-6 pb-6 pt-6"
            >
              <CasoFormSgpRiscoCadastro
                name="idRisco"
                labelName="idRiscoLabel"
                label="Descrição do Risco"
                placeholder="Selecione o risco..."
                required
                queryEnabled={open}
                fallbackOption={riscoFallback ?? undefined}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RiscoFormNivelSelect
                  name="probalidade"
                  label="Probabilidade"
                  placeholder="Selecione a probabilidade..."
                  disabled={!canEdit || isSubmitting}
                  required
                />
                <RiscoFormNivelSelect
                  name="impacto"
                  label="Impacto"
                  placeholder="Selecione o nível de impacto..."
                  disabled={!canEdit || isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="risco-mitigacao">Mitigação</FieldLabel>
                <Textarea
                  id="risco-mitigacao"
                  placeholder="O que faremos para evitar que este risco aconteça?"
                  className="min-h-[80px] resize-none rounded-lg border-border-input"
                  disabled={!canEdit || isSubmitting}
                  {...form.register("mitigacao")}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="risco-contingencia">Contingência</FieldLabel>
                <Textarea
                  id="risco-contingencia"
                  placeholder="O que faremos se este risco se concretizar?"
                  className="min-h-[80px] resize-none rounded-lg border-border-input"
                  disabled={!canEdit || isSubmitting}
                  {...form.register("contingencia")}
                />
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
                    "Adicionar Risco"
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
