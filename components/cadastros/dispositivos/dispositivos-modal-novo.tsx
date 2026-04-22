"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCreateDevice, useUpdateDevice } from "@/hooks/use-create-device";
import { deviceCreateSchema } from "@/lib/validators/db/devices";
import type { DeviceCreateInput } from "@/lib/validators/db/devices";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DispositivosModalSkeleton } from "./dispositivos-modal-skeleton";

type FormValues = DeviceCreateInput;

interface DispositivosModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  isLoadingEdit?: boolean;
  initialData?: {
    id: string;
    name: string;
  } | null;
}

export function DispositivosModalNovo({
  open,
  onOpenChange,
  mode = "create",
  isLoadingEdit = false,
  initialData = null,
}: DispositivosModalNovoProps) {
  const queryClient = useQueryClient();
  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice();

  const form = useForm<FormValues>({
    resolver: zodResolver(deviceCreateSchema),
    defaultValues: { name: "" },
  });

  const isEditMode =
    mode === "edit" && Boolean(initialData?.id) && !isLoadingEdit;
  const isSubmitting =
    createDeviceMutation.isPending || updateDeviceMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset({ name: initialData?.name ?? "" });
    }
  }, [open, initialData, form]);

  const handleClose = (next: boolean) => {
    if (!next) form.reset({ name: "" });
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateDeviceMutation.mutateAsync({
          id: initialData.id,
          input: { name: values.name.trim() },
        });
        toast.success("Dispositivo atualizado.");
      } else {
        await createDeviceMutation.mutateAsync({ name: values.name.trim() });
        toast.success("Dispositivo cadastrado.");
      }
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-devices"] });
      if (isEditMode && initialData?.id) {
        await queryClient.invalidateQueries({
          queryKey: ["db-device", initialData.id],
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar dispositivo";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-0 space-y-1.5">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
            {mode === "edit" ? "Editar dispositivo" : "Novo dispositivo"}
          </DialogTitle>
          {isLoadingEdit ? (
            <Skeleton className="h-4 w-[min(100%,260px)] mt-1" />
          ) : (
            <p className="text-sm font-semibold text-zinc-400">
              {isEditMode
                ? "Atualize o nome do dispositivo abaixo"
                : "Preencha o nome do dispositivo abaixo"}
            </p>
          )}
        </DialogHeader>
        {isLoadingEdit ? (
          <DispositivosModalSkeleton />
        ) : (
          <form onSubmit={onSubmit} className="px-6 pb-8 pt-6 space-y-8">
            <div className="space-y-1.5">
              <Label
                htmlFor="dev-name"
                className="text-sm font-medium text-zinc-900"
              >
                Nome<span className="text-red-500">*</span>
              </Label>
              <Input
                id="dev-name"
                autoComplete="off"
                placeholder="Ex: L400, DX8000..."
                className="h-11 rounded-lg px-4 border-zinc-200 placeholder:text-zinc-400"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive pt-0.5">
                  {form.formState.errors.name.message}
                </p>
              )}
              <p className="text-xs font-semibold text-zinc-400 pt-0.5">
                Modelo do terminal POS (ponto de venda)
              </p>
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-zinc-200 px-6 text-zinc-900"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-lg px-6 bg-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Salvando..."
                    : "Cadastrando..."
                  : isEditMode
                    ? "Salvar"
                    : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
