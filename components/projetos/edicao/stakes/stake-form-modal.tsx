"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import { useSgpTipos } from "@/hooks/catalogos/use-sgp-tipos";
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
  const [usuarioSearch, setUsuarioSearch] = useState("");
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const isEditMode = mode === "edit";

  const form = useForm<StakeFormValues>({
    resolver: zodResolver(stakeFormSchema),
    defaultValues: stakeFormDefaultValues,
  });

  const createStake = useCreateSgpStake({ projetoId });
  const updateStake = useUpdateSgpStake({ projetoId });

  const { data: usuarios = [] } = useUsuariosProjetos({
    search: usuarioSearch.length >= 2 ? usuarioSearch : undefined,
    enabled: open,
  });

  const { data: tiposResponse } = useSgpTipos({
    tipo: "STAKEHOLDERS",
    enabled: open,
  });

  const usuarioOptions = useMemo(() => {
    const base = usuarios.map((u) => ({
      value: u.id,
      label: u.nome_suporte?.trim() || `Usuário #${u.id}`,
    }));
    if (isEditMode && stake?.suporte_id) {
      const id = String(stake.suporte_id);
      if (!base.some((o) => o.value === id)) {
        return [
          {
            value: id,
            label: stake.nomes?.trim() || `Usuário #${id}`,
          },
          ...base,
        ];
      }
    }
    return base;
  }, [usuarios, isEditMode, stake]);

  const tipoOptions = useMemo(() => {
    const base = (tiposResponse?.data ?? []).map((t) => ({
      value: String(t.Registro),
      label: t.Nomes?.trim() || `Tipo ${t.Registro}`,
    }));
    if (isEditMode && stake?.id_tipo) {
      const id = String(stake.id_tipo);
      if (!base.some((o) => o.value === id)) {
        return [
          { value: id, label: `Tipo ${id}` },
          ...base,
        ];
      }
    }
    return base;
  }, [tiposResponse?.data, isEditMode, stake]);

  const colaboradorId = form.watch("colaboradorId");
  const idTipo = form.watch("idTipo");

  useEffect(() => {
    if (!open) return;
    if (isEditMode && stake) {
      form.reset(stakeToFormValues(stake));
    } else {
      form.reset(stakeFormDefaultValues);
    }
    setUsuarioSearch("");
  }, [open, isEditMode, stake, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(stakeFormDefaultValues);
      setUsuarioSearch("");
    }
    onOpenChange(next);
  };

  const isSubmitting = createStake.isPending || updateStake.isPending;

  const resolveColaboradorNome = (values: StakeFormValues) =>
    usuarioOptions.find((o) => o.value === values.colaboradorId)?.label ??
    usuarios.find((u) => u.id === values.colaboradorId)?.nome_suporte ??
    (isEditMode ? stake?.nomes : "") ??
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

        <form onSubmit={onSubmit} className="space-y-6 px-6 pb-6 pt-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <RequiredLabel>Colaborador</RequiredLabel>
              <Combobox
                options={usuarioOptions}
                value={colaboradorId || undefined}
                onValueChange={(v) =>
                  form.setValue("colaboradorId", v ?? "", {
                    shouldValidate: true,
                  })
                }
                placeholder="Selecione o colaborador..."
                searchPlaceholder="Buscar colaborador..."
                emptyText="Nenhum colaborador encontrado"
                onSearchChange={setUsuarioSearch}
                searchDebounceMs={300}
                disabled={!canEdit || isSubmitting}
                className="h-11 w-full rounded-lg border-border"
              />
              {form.formState.errors.colaboradorId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.colaboradorId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Função</RequiredLabel>
                <Combobox
                  options={tipoOptions}
                  value={idTipo || undefined}
                  onValueChange={(v) =>
                    form.setValue("idTipo", v ?? "", { shouldValidate: true })
                  }
                  placeholder="Selecione a função..."
                  searchPlaceholder="Buscar função..."
                  emptyText="Nenhuma função encontrada"
                  disabled={!canEdit || isSubmitting}
                  className="h-11 w-full rounded-lg border-border"
                />
                {form.formState.errors.idTipo && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.idTipo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="stake-dias">Dias</RequiredLabel>
                <Input
                  id="stake-dias"
                  type="number"
                  min={1}
                  step={1}
                  className="h-11 rounded-lg border-border"
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
                  className="h-11 rounded-lg border-border"
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
                  className="h-11 rounded-lg border-border"
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
              type="submit"
              className="h-[38px] rounded-lg"
              disabled={!canEdit || isSubmitting}
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
      </DialogContent>
    </Dialog>
  );
}
