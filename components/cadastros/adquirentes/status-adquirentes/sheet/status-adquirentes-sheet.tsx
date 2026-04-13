"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { SwitchChoiceCard } from "@/components/ui/switch-choice-card";
import { useQuery } from "@tanstack/react-query";
import { listDevicesClient } from "@/services/db-api/list-cadastros";
import {
  useAcquirerCompatibleDevicesByStatus,
  useAcquirerStatusById,
  useCreateAcquirerStatus,
  useLinkAcquirerCompatibleDevice,
  useUnlinkAcquirerCompatibleDevice,
  useUpdateAcquirerStatus,
} from "@/hooks/use-create-acquirer-status";
import {
  AcquirerStatusAcquirerField,
  AcquirerStatusCurrentVersionField,
  AcquirerStatusDevicesField,
  AcquirerStatusNextVersionField,
  AcquirerStatusStatusField,
} from "../fields";
import { cn } from "@/lib/utils";

const NONE_OPTION = "__none__";

const formSchema = z.object({
  acquirerId: z.string().uuid("Selecione a adquirente."),
  status: z.string().min(1, "Selecione o status."),
  currentVersionId: z.string().uuid("Selecione a versão atual."),
  nextVersionId: z.string().optional(),
  supportedDeviceIds: z.array(z.string().uuid()).default([]),
  recommendedDeviceId: z.string().uuid().nullable().optional(),
  deliveryDate: z.date().optional(),
  sortOrder: z.string().optional(),
  obs: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type StatusAdquirentesFormValues = z.infer<typeof formSchema>;

interface StatusAdquirentesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  statusId?: string | null;
}

function toIsoDateOnly(date: Date | undefined): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToDate(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return undefined;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function StatusAdquirentesSheet({
  open,
  onOpenChange,
  mode,
  statusId,
}: StatusAdquirentesSheetProps) {
  const queryClient = useQueryClient();

  const createMutation = useCreateAcquirerStatus();
  const updateMutation = useUpdateAcquirerStatus();
  const getStatusByIdMutation = useAcquirerStatusById();
  const getCompatiblesMutation = useAcquirerCompatibleDevicesByStatus();
  const linkDeviceMutation = useLinkAcquirerCompatibleDevice();
  const unlinkDeviceMutation = useUnlinkAcquirerCompatibleDevice();

  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const initialDeviceIdsRef = useRef<string[]>([]);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const form = useForm<StatusAdquirentesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acquirerId: "",
      status: "",
      currentVersionId: "",
      nextVersionId: "",
      supportedDeviceIds: [],
      recommendedDeviceId: null,
      deliveryDate: undefined,
      sortOrder: "",
      obs: "",
      isActive: true,
    },
  });

  const { reset, setValue, getValues } = form;
  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;
  const getValuesRef = useRef(getValues);
  getValuesRef.current = getValues;
  /** `reset` do RHF muda a cada render; não pode ir nas deps do efeito de abrir o sheet. */
  const resetRef = useRef(reset);
  resetRef.current = reset;
  const getStatusByIdMutateRef = useRef(getStatusByIdMutation.mutateAsync);
  getStatusByIdMutateRef.current = getStatusByIdMutation.mutateAsync;
  const getCompatiblesMutateRef = useRef(getCompatiblesMutation.mutateAsync);
  getCompatiblesMutateRef.current = getCompatiblesMutation.mutateAsync;

  const selectedDeviceIds = useWatch({
    control: form.control,
    name: "supportedDeviceIds",
  });
  const recommendedDeviceId = useWatch({
    control: form.control,
    name: "recommendedDeviceId",
  });

  const { data: devicesList } = useQuery({
    queryKey: ["db-devices", "sheet-options"],
    queryFn: () => listDevicesClient(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const deviceNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const device of devicesList ?? []) {
      map.set(device.id, device.name);
    }
    return map;
  }, [devicesList]);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    linkDeviceMutation.isPending ||
    unlinkDeviceMutation.isPending;

  /**
   * Só reage a `open`, `mode` e `statusId`. Não incluir `reset` nem retornos de
   * `useMutation`: novas referências a cada render apagariam o formulário ao
   * selecionar campos (ex.: dispositivos) ou estourariam atualização em profundidade.
   */
  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      initialDeviceIdsRef.current = [];
      resetRef.current({
        acquirerId: "",
        status: "",
        currentVersionId: "",
        nextVersionId: "",
        supportedDeviceIds: [],
        recommendedDeviceId: null,
        deliveryDate: undefined,
        sortOrder: "",
        obs: "",
        isActive: true,
      });
      return;
    }

    if (!statusId) return;

    let cancelled = false;
    const load = async () => {
      setIsLoadingEditData(true);
      try {
        const [statusRow, linkedDevices] = await Promise.all([
          getStatusByIdMutateRef.current(statusId),
          getCompatiblesMutateRef.current(statusId),
        ]);
        if (cancelled) return;

        const linkedIds = linkedDevices.map((item) => item.deviceId);
        initialDeviceIdsRef.current = linkedIds;

        resetRef.current({
          acquirerId: statusRow.acquirerId,
          status: statusRow.status,
          currentVersionId: statusRow.currentVersionId,
          nextVersionId: statusRow.nextVersionId ?? "",
          supportedDeviceIds: linkedIds,
          recommendedDeviceId: statusRow.recommendedDeviceId ?? null,
          deliveryDate: isoToDate(statusRow.deliveryDate),
          sortOrder:
            typeof statusRow.sortOrder === "number" ? String(statusRow.sortOrder) : "",
          obs: statusRow.obs ?? "",
          isActive: statusRow.isActive,
        });
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Erro ao carregar dados do status.";
          toast.error(message);
          onOpenChangeRef.current(false);
        }
      } finally {
        if (!cancelled) setIsLoadingEditData(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, mode, statusId]);

  const selectedDevicesKey = useMemo(
    () => JSON.stringify(selectedDeviceIds ?? []),
    [selectedDeviceIds],
  );

  useEffect(() => {
    let selected: string[] = [];
    try {
      selected = JSON.parse(selectedDevicesKey) as string[];
      if (!Array.isArray(selected)) selected = [];
    } catch {
      selected = [];
    }

    if (selected.length === 0) {
      const current = getValuesRef.current("recommendedDeviceId");
      if (current != null) {
        setValueRef.current("recommendedDeviceId", null, { shouldDirty: true });
      }
      return;
    }

    const current = getValuesRef.current("recommendedDeviceId");
    if (current == null || !selected.includes(current)) {
      const next = selected[0];
      if (current !== next) {
        setValueRef.current("recommendedDeviceId", next, { shouldDirty: true });
      }
    }
  }, [selectedDevicesKey]);

  const onSubmit = form.handleSubmit(async (values) => {
    const nextVersionId =
      values.nextVersionId && values.nextVersionId !== NONE_OPTION
        ? values.nextVersionId
        : null;
    const sortOrder = values.sortOrder?.trim()
      ? Number(values.sortOrder.trim())
      : undefined;

    if (sortOrder != null && !Number.isInteger(sortOrder)) {
      toast.error("A ordem de exibição deve ser um número inteiro.");
      return;
    }

    const compatibleDevices = (values.supportedDeviceIds ?? []).map((deviceId) => ({
      deviceId,
    }));

    const payload = {
      acquirerId: values.acquirerId,
      currentVersionId: values.currentVersionId,
      status: values.status as
        | "Em desenvolvimento"
        | "Em teste"
        | "Em homologação"
        | "Em certificação"
        | "Concluído",
      nextVersionId,
      deliveryDate: toIsoDateOnly(values.deliveryDate),
      recommendedDeviceId:
        values.recommendedDeviceId && compatibleDevices.some((d) => d.deviceId === values.recommendedDeviceId)
          ? values.recommendedDeviceId
          : null,
      sortOrder,
      isActive: values.isActive,
      obs: values.obs?.trim() ? values.obs.trim() : null,
      compatibleDevices,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success("Status da adquirente cadastrado com sucesso.");
      } else {
        if (!statusId) {
          toast.error("Status inválido para edição.");
          return;
        }

        await updateMutation.mutateAsync({
          id: statusId,
          input: {
            acquirerId: payload.acquirerId,
            currentVersionId: payload.currentVersionId,
            status: payload.status,
            nextVersionId: payload.nextVersionId,
            deliveryDate: payload.deliveryDate,
            recommendedDeviceId: payload.recommendedDeviceId,
            sortOrder: payload.sortOrder,
            isActive: payload.isActive,
            obs: payload.obs,
          },
        });

        const initialIds = new Set(initialDeviceIdsRef.current);
        const finalIds = new Set(values.supportedDeviceIds ?? []);

        const toAdd = [...finalIds].filter((id) => !initialIds.has(id));
        const toRemove = [...initialIds].filter((id) => !finalIds.has(id));

        for (const deviceId of toAdd) {
          await linkDeviceMutation.mutateAsync({ statusId, deviceId });
        }
        for (const deviceId of toRemove) {
          await unlinkDeviceMutation.mutateAsync({ statusId, deviceId });
        }

        toast.success("Status da adquirente atualizado com sucesso.");
      }

      await queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
      await queryClient.invalidateQueries({ queryKey: ["db-acquirers", "sheet-options"] });
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar status.";
      toast.error(message);
    }
  });

  return (
    // Combobox/listas em portal no body não recebem clique com Dialog modal (pointer-events fora do painel).
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[488px] p-0 gap-0 border-border-divider [&>button]:hidden"
      >
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex min-h-0 h-full flex-col">
            <SheetHeader className="px-6 pt-8 pb-0 space-y-1.5 shrink-0">
              <SheetTitle className="text-base font-semibold text-black">
                {mode === "create"
                  ? "Nova Status de Adquirente"
                  : "Editar Status de Adquirente"}
              </SheetTitle>
              <SheetDescription className="text-sm text-[#9ca3af]">
                Configure o status, versões e dispositivos da adquirente
              </SheetDescription>
            </SheetHeader>

            {isLoadingEditData ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 space-y-4">
                  <AcquirerStatusAcquirerField disabled={isSaving} />
                  <AcquirerStatusStatusField disabled={isSaving} />

                  <div className="border-t border-border-divider" />

                  <AcquirerStatusCurrentVersionField disabled={isSaving} />
                  <AcquirerStatusNextVersionField disabled={isSaving} />

                  <div className="border-t border-border-divider" />

                  <AcquirerStatusDevicesField disabled={isSaving} />

                  <div className="rounded-lg border border-border-divider bg-muted/30 p-2 space-y-2">
                    <p className="text-xs font-bold text-[#9ca3af]">
                      Dispositivos vinculados ({selectedDeviceIds?.length ?? 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedDeviceIds ?? []).map((deviceId) => {
                        const isPrimary = recommendedDeviceId === deviceId;
                        return (
                          <button
                            key={deviceId}
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors",
                              isPrimary
                                ? "border-[#bdd1ff] bg-[#e4f0ff] text-black"
                                : "border-border-divider bg-white text-black",
                            )}
                            onClick={() =>
                              form.setValue("recommendedDeviceId", deviceId, {
                                shouldDirty: true,
                              })
                            }
                            disabled={isSaving}
                          >
                            <Star
                              className={cn(
                                "h-3.5 w-3.5",
                                isPrimary
                                  ? "fill-blue-500 text-blue-500"
                                  : "text-muted-foreground",
                              )}
                            />
                            {deviceNameById.get(deviceId) ?? deviceId.slice(0, 8)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-semibold text-[#9ca3af]">
                      Clique na estrela para definir o dispositivo principal
                    </p>
                  </div>

                  <div className="border-t border-border-divider" />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-label">
                      Data de envio para certificação
                    </Label>
                    <DatePicker
                      value={form.watch("deliveryDate")}
                      onChange={(date) =>
                        form.setValue("deliveryDate", date, { shouldDirty: true })
                      }
                      disabled={isSaving}
                      placeholder="dd/mm/aaaa"
                      className="[&_button]:h-[42px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-label">
                      Ordem de exibição
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Ex: 1,2,3..."
                      className="h-[42px] rounded-lg border-border-input"
                      disabled={isSaving}
                      {...form.register("sortOrder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-label">
                      Observações
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Observações sobre esse status"
                      className="rounded-lg border-border-input resize-none"
                      disabled={isSaving}
                      {...form.register("obs")}
                    />
                  </div>

                  <SwitchChoiceCard
                    id="acquirer-status-is-active"
                    title="Status"
                    description="Define se será exibido no painel"
                    checked={Boolean(form.watch("isActive"))}
                    onCheckedChange={(checked) =>
                      form.setValue("isActive", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="shrink-0 border-t border-border-divider bg-background px-6 py-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => onOpenChange(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full h-10" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : mode === "create" ? (
                      "Cadastrar"
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
