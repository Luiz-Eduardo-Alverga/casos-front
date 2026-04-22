"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  useCreateAcquirer,
  useUpdateAcquirer,
} from "@/hooks/use-create-acquirer";
import { acquirerCreateSchema } from "@/lib/validators/db/acquirers";
import type { AcquirerCreateInput } from "@/lib/validators/db/acquirers";
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
import { SwitchChoiceCard } from "@/components/ui/switch-choice-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdquirentesModalSkeleton } from "./adquirentes-modal-skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  logoUrl: z.string().optional(),
  has4g: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdquirentesModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  /** Enquanto o GET por id não retorna (edição). */
  isLoadingEdit?: boolean;
  initialData?: {
    id: string;
    name: string;
    logoUrl: string | null;
    has4g: boolean | null;
  } | null;
}

export function AdquirentesModalNovo({
  open,
  onOpenChange,
  mode = "create",
  isLoadingEdit = false,
  initialData = null,
}: AdquirentesModalNovoProps) {
  const queryClient = useQueryClient();
  const createAcquirerMutation = useCreateAcquirer();
  const updateAcquirerMutation = useUpdateAcquirer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", logoUrl: "", has4g: false },
  });

  const [logoError, setLogoError] = useState<string | undefined>();
  const isEditMode =
    mode === "edit" && Boolean(initialData?.id) && !isLoadingEdit;
  const isSubmitting =
    createAcquirerMutation.isPending || updateAcquirerMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        logoUrl: initialData?.logoUrl ?? "",
        has4g: initialData?.has4g ?? false,
      });
      setLogoError(undefined);
    }
  }, [open, initialData, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset({ name: "", logoUrl: "", has4g: false });
      setLogoError(undefined);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const trimmedLogo = values.logoUrl?.trim() ?? "";
    const body: AcquirerCreateInput = {
      name: values.name.trim(),
      has4g: values.has4g,
    };
    if (trimmedLogo) body.logoUrl = trimmedLogo;

    const parsed = acquirerCreateSchema.safeParse(body);
    if (!parsed.success) {
      const logoIssue = parsed.error.flatten().fieldErrors.logoUrl?.[0];
      setLogoError(logoIssue);
      return;
    }
    setLogoError(undefined);

    try {
      if (isEditMode && initialData?.id) {
        await updateAcquirerMutation.mutateAsync({
          id: initialData.id,
          input: parsed.data,
        });
        toast.success("Adquirente atualizado.");
      } else {
        await createAcquirerMutation.mutateAsync(parsed.data);
        toast.success("Adquirente cadastrado.");
      }
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
      if (isEditMode && initialData?.id) {
        await queryClient.invalidateQueries({
          queryKey: ["db-acquirer", initialData.id],
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar adquirente";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-0 space-y-1.5">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
            {mode === "edit" ? "Editar adquirente" : "Nova adquirente"}
          </DialogTitle>
          {isLoadingEdit ? (
            <Skeleton className="h-4 w-[min(100%,280px)] mt-1" />
          ) : (
            <p className="text-sm font-semibold text-zinc-400">
              {isEditMode
                ? "Atualize os dados da adquirente abaixo"
                : "Preencha os dados da adquirente abaixo"}
            </p>
          )}
        </DialogHeader>
        {isLoadingEdit ? (
          <AdquirentesModalSkeleton />
        ) : (
          <form onSubmit={onSubmit} className="px-6 pb-8 pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="acq-name"
                className="text-sm font-medium text-zinc-900"
              >
                Nome<span className="text-red-500">*</span>
              </Label>
              <Input
                id="acq-name"
                autoComplete="off"
                placeholder="Ex: Getnet, Rede, Stone..."
                className="h-11 rounded-lg px-4 border-zinc-200 placeholder:text-zinc-400"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="acq-logo"
                className="text-sm font-medium text-zinc-900"
              >
                URL da logo
              </Label>
              <Input
                id="acq-logo"
                type="url"
                placeholder="https://logoexemplo.com"
                className="h-11 rounded-lg px-4 border-zinc-200 placeholder:text-zinc-400"
                autoComplete="off"
                {...form.register("logoUrl")}
              />
              {logoError && (
                <p className="text-sm text-destructive">{logoError}</p>
              )}
            </div>

            <SwitchChoiceCard
              id="acq-4g"
              title="Suporta 4G"
              description="Indica se a adquirente tem suporte para conexão 4G"
              checked={form.watch("has4g")}
              onCheckedChange={(checked) =>
                form.setValue("has4g", checked, { shouldValidate: true })
              }
            />

            <DialogFooter className="gap-2 sm:justify-end pt-2">
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
