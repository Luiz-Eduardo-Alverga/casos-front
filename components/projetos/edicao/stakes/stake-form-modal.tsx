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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormSgpTipo } from "@/components/fields/caso-form-sgp-tipo";
import { importanceOptions } from "@/mocks/teste";
import { useCreateSgpStake } from "@/hooks/projetos/use-create-sgp-stake";
import { useUpdateSgpStake } from "@/hooks/projetos/use-update-sgp-stake";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import {
  buildCreateSgpStakePayload,
  buildUpdateSgpStakePayload,
  maskStakeHorasInput,
  stakeToFormValues,
} from "@/components/projetos/edicao/stakes/stake-form-utils";
import {
  stakeFormDefaultValues,
  stakeFormSchema,
  type StakeFormValues,
} from "@/components/projetos/edicao/stakes/stake-form-schema";

export interface StakeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  projetoId: number | string;
  stake?: SgpStakeItem | null;
}

function RequiredLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-text-label">
      {children}
      <span className="text-destructive"> *</span>
    </Label>
  );
}

export function StakeFormModal({
  open,
  onOpenChange,
  mode,
  projetoId,
  stake = null,
}: StakeFormModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const isEditMode = mode === "edit";

  const form = useForm<StakeFormValues>({
    resolver: zodResolver(stakeFormSchema),
    defaultValues: stakeFormDefaultValues,
  });

  const createStake = useCreateSgpStake({ projetoId });
  const updateStake = useUpdateSgpStake({ projetoId });
  const isSubmitting = createStake.isPending || updateStake.isPending;

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

  const funcaoFallback = useMemo(() => {
    if (!isEditMode || !stake?.id_tipo) return null;
    return {
      value: String(stake.id_tipo),
      label: `Tipo ${stake.id_tipo}`,
    };
  }, [isEditMode, stake]);

  useEffect(() => {
    if (!open) return;
    if (isEditMode && stake) {
      form.reset(stakeToFormValues(stake));
    } else {
      form.reset(stakeFormDefaultValues);
    }
  }, [open, isEditMode, stake, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(stakeFormDefaultValues);
    }
    onOpenChange(next);
  };

  const resolveColaboradorNome = (values: StakeFormValues) =>
    values.colaboradorLabel?.trim() ||
    (isEditMode ? stake?.nomes?.trim() : "") ||
    "";

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }

    const colaborador = resolveColaboradorNome(values).trim();
    if (!colaborador) {
      toast.error("Selecione um colaborador válido.");
      return;
    }

    try {
      if (isEditMode) {
        if (!stake?.sequencia) {
          toast.error("Stake inválido para edição.");
          return;
        }
        const payload = buildUpdateSgpStakePayload(
          values,
          projetoId,
          colaborador,
          stake,
        );
        const response = await updateStake.mutateAsync({
          sequencia: stake.sequencia,
          data: payload,
        });
        toast.success(
          response.message ?? "Stakeholder atualizado com sucesso.",
        );
      } else {
        const payload = buildCreateSgpStakePayload(
          values,
          projetoId,
          colaborador,
        );
        const response = await createStake.mutateAsync(payload);
        toast.success(
          response.message ?? "Stakeholder cadastrado com sucesso.",
        );
      }
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Erro ao atualizar stakeholder."
            : "Erro ao cadastrar stakeholder.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Editar Stakeholder" : "Adicionar Stakeholder"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Defina o usuário que irá participar do projeto
          </p>
        </DialogHeader>

        <FormProvider {...form}>
          <CasoFormProvider value={casoFormProviderValue}>
            <form
              onSubmit={(e) => {
                e.stopPropagation();
                onSubmit(e);
              }}
              className="space-y-6 px-6 pb-6 pt-6"
            >
              <div className="space-y-3">
                <CasoFormDevAtribuido
                  name="colaboradorId"
                  labelName="colaboradorLabel"
                  label="Colaborador"
                  placeholder="Selecione o colaborador..."
                  requireProduto={false}
                  controlHeightClassName="h-9 rounded-lg border-border-input"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <CasoFormSgpTipo
                    name="idTipo"
                    label="Função"
                    tipo="STAKEHOLDERS"
                    placeholder="Selecione a função..."
                    emptyText="Nenhuma função encontrada."
                    required
                    queryEnabled={open}
                    fallbackOption={funcaoFallback}
                  />

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="stake-dias">Dias</RequiredLabel>
                    <Input
                      id="stake-dias"
                      type="number"
                      min={1}
                      step={1}
                      className="h-9 rounded-lg border-border-input"
                      disabled={!canEdit || isSubmitting}
                      {...form.register("diasUteis", { valueAsNumber: true })}
                    />
                    {form.formState.errors.diasUteis && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.diasUteis.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="stake-horas-planejadas">
                      Horas planejadas
                    </RequiredLabel>
                    <Input
                      id="stake-horas-planejadas"
                      inputMode="numeric"
                      placeholder="00:00"
                      className="h-9 rounded-lg border-border-input"
                      disabled={!canEdit || isSubmitting}
                      value={form.watch("horasPlanejadas")}
                      onChange={(e) =>
                        form.setValue(
                          "horasPlanejadas",
                          maskStakeHorasInput(e.target.value),
                          { shouldValidate: true },
                        )
                      }
                    />
                    {form.formState.errors.horasPlanejadas && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.horasPlanejadas.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="stake-horas-nao-planejadas">
                      Horas não planejadas
                    </RequiredLabel>
                    <Input
                      id="stake-horas-nao-planejadas"
                      inputMode="numeric"
                      placeholder="00:00"
                      className="h-9 rounded-lg border-border-input"
                      disabled={!canEdit || isSubmitting}
                      value={form.watch("horasNaoPlanejadas")}
                      onChange={(e) =>
                        form.setValue(
                          "horasNaoPlanejadas",
                          maskStakeHorasInput(e.target.value),
                          { shouldValidate: true },
                        )
                      }
                    />
                    {form.formState.errors.horasNaoPlanejadas && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.horasNaoPlanejadas.message}
                      </p>
                    )}
                  </div>
                </div>
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
                    "Salvar"
                  ) : (
                    "Adicionar"
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
