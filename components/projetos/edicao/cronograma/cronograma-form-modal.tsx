"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, ListChecks, Loader2 } from "lucide-react";
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
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormSgpTipo } from "@/components/fields/caso-form-sgp-tipo";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import { useCreateSgpCronograma } from "@/hooks/projetos/use-create-sgp-cronograma";
import { useUpdateSgpCronograma } from "@/hooks/projetos/use-update-sgp-cronograma";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { importanceOptions } from "@/mocks/teste";
import { maskStakeHorasInput } from "@/components/projetos/edicao/stakes/stake-form-utils";
import {
  buildCreateSgpCronogramaPayload,
  buildPapelOptions,
  buildTarefaTipoOptions,
  buildUpdateSgpCronogramaPayload,
  cronogramaToFormValues,
  resolveColaboradorFromObjetivoQuem,
} from "@/components/projetos/edicao/cronograma/cronograma-form-utils";
import {
  cronogramaFormDefaultValues,
  cronogramaFormSchema,
  type CronogramaFormValues,
} from "@/components/projetos/edicao/cronograma/cronograma-form-schema";

const FORM_CONTROL_CLASS = "h-9 rounded-lg border-border-input";

export interface CronogramaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  projetoId: number | string;
  tarefa?: SgpCronogramaItem | null;
}

export function CronogramaFormModal({
  open,
  onOpenChange,
  mode,
  projetoId,
  tarefa = null,
}: CronogramaFormModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const isEditMode = mode === "edit";

  const form = useForm<CronogramaFormValues>({
    resolver: zodResolver(cronogramaFormSchema),
    defaultValues: cronogramaFormDefaultValues,
  });

  const createCronograma = useCreateSgpCronograma({ projetoId });
  const updateCronograma = useUpdateSgpCronograma({ projetoId });
  const isSubmitting = createCronograma.isPending || updateCronograma.isPending;

  const { data: usuariosProjetos } = useUsuariosProjetos({
    enabled: open && isEditMode,
  });

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

  const papelFallback = useMemo(() => {
    if (!isEditMode || !tarefa?.id_papel) return null;
    return {
      value: String(tarefa.id_papel),
      label: `Papel ${tarefa.id_papel}`,
    };
  }, [isEditMode, tarefa]);

  const tarefaFallback = useMemo(() => {
    if (!isEditMode || !tarefa?.id_tipo) return null;
    return {
      value: String(tarefa.id_tipo),
      label: `Tipo ${tarefa.id_tipo}`,
    };
  }, [isEditMode, tarefa]);

  useEffect(() => {
    if (!open) return;
    if (isEditMode && tarefa) {
      form.reset(cronogramaToFormValues(tarefa));
    } else {
      form.reset(cronogramaFormDefaultValues);
    }
  }, [open, isEditMode, tarefa, form]);

  useEffect(() => {
    if (!open || !isEditMode || !tarefa?.objetivo_quem?.trim()) return;
    if (!usuariosProjetos?.length) return;

    const resolved = resolveColaboradorFromObjetivoQuem(
      tarefa.objetivo_quem,
      usuariosProjetos,
    );
    if (!resolved) return;

    form.setValue("colaboradorId", resolved.colaboradorId, {
      shouldDirty: false,
      shouldValidate: true,
    });
    form.setValue("colaboradorLabel", resolved.colaboradorLabel, {
      shouldDirty: false,
    });
  }, [open, isEditMode, tarefa, usuariosProjetos, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(cronogramaFormDefaultValues);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }

    const responsavelNome = values.colaboradorLabel?.trim();
    if (!responsavelNome) {
      toast.error("Selecione um responsável válido.");
      return;
    }

    try {
      if (isEditMode) {
        if (!tarefa?.sequencia) {
          toast.error("Tarefa inválida para edição.");
          return;
        }
        const payload = buildUpdateSgpCronogramaPayload(
          values,
          projetoId,
          tarefa,
        );
        const response = await updateCronograma.mutateAsync({
          sequencia: tarefa.sequencia,
          data: payload,
        });
        toast.success(response.message ?? "Tarefa atualizada com sucesso.");
      } else {
        const payload = buildCreateSgpCronogramaPayload(values, projetoId);
        const response = await createCronograma.mutateAsync(payload);
        toast.success(response.message ?? "Tarefa cadastrada com sucesso.");
      }
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Erro ao atualizar tarefa."
            : "Erro ao cadastrar tarefa.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Editar Tarefa" : "Adicionar Tarefa"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Defina o Tipo da Tarefa o responsável e as demais informações
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
                <CasoFormSgpTipo
                  name="idPapel"
                  label="Papel"
                  tipo="STAKEHOLDERS"
                  icon={Briefcase}
                  placeholder="Selecione o papel..."
                  emptyText="Nenhum papel encontrado."
                  required
                  queryEnabled={open}
                  fallbackOption={papelFallback}
                />

                <CasoFormSgpTipo
                  name="idTipo"
                  label="Tipo / Tarefa"
                  icon={ListChecks}
                  tipo="CRONOGRAMA"
                  placeholder="Selecione a tarefa..."
                  emptyText="Nenhuma tarefa encontrada."
                  required
                  queryEnabled={open}
                  mapOptions={buildTarefaTipoOptions}
                  fallbackOption={tarefaFallback}
                />

                <CasoFormDevAtribuido
                  name="colaboradorId"
                  labelName="colaboradorLabel"
                  label="Responsável"
                  placeholder="Selecione o responsável..."
                  requireProduto={false}
                  controlHeightClassName={FORM_CONTROL_CLASS}
                />
                {form.formState.errors.colaboradorId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.colaboradorId.message}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label
                        htmlFor="cronograma-hora-prevista"
                        className="text-sm font-medium text-text-label"
                      >
                        Horas Previstas{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      {form.formState.errors.horaPrevista && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.horaPrevista.message}
                        </p>
                      )}
                    </div>
                    <Input
                      id="cronograma-hora-prevista"
                      inputMode="numeric"
                      placeholder="00:00"
                      className={FORM_CONTROL_CLASS}
                      disabled={!canEdit || isSubmitting}
                      value={form.watch("horaPrevista")}
                      onChange={(e) =>
                        form.setValue(
                          "horaPrevista",
                          maskStakeHorasInput(e.target.value),
                          { shouldValidate: true },
                        )
                      }
                    />
                  </div>

                  <DatePickerInput
                    label="Data de Início"
                    required
                    value={form.watch("dataInicio")}
                    onChange={(date) =>
                      form.setValue("dataInicio", date, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="dd/mm/aaaa"
                    disabled={!canEdit || isSubmitting}
                    controlHeightClassName={FORM_CONTROL_CLASS}
                  />
                </div>
                {form.formState.errors.dataInicio && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dataInicio.message}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DatePickerInput
                    label="Data de Término"
                    required
                    value={form.watch("dataTermino")}
                    onChange={(date) =>
                      form.setValue("dataTermino", date, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="dd/mm/aaaa"
                    disabled={!canEdit || isSubmitting}
                    controlHeightClassName={FORM_CONTROL_CLASS}
                  />
                  <DatePickerInput
                    label="Data de realização"
                    value={form.watch("dataRealizacao")}
                    onChange={(date) =>
                      form.setValue("dataRealizacao", date, {
                        shouldValidate: false,
                      })
                    }
                    placeholder="dd/mm/aaaa"
                    disabled={!canEdit || isSubmitting}
                    controlHeightClassName={FORM_CONTROL_CLASS}
                  />
                </div>
                {form.formState.errors.dataTermino && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dataTermino.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="cronograma-observacao"
                    className="text-sm font-medium text-text-label"
                  >
                    Observações
                  </Label>
                  <Textarea
                    id="cronograma-observacao"
                    placeholder="Observações sobre esse status"
                    className="min-h-[80px] resize-none rounded-lg border-border-input"
                    disabled={!canEdit || isSubmitting}
                    {...form.register("observacao")}
                  />
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
