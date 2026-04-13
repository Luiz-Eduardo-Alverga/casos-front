"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCreateVersion, useUpdateVersion } from "@/hooks/use-create-version";
import { versionCreateSchema } from "@/lib/validators/db/versions";
import type { VersionCreateInput } from "@/lib/validators/db/versions";
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

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface VersoesModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
  } | null;
}

export function VersoesModalNovo({
  open,
  onOpenChange,
  mode = "create",
  initialData = null,
}: VersoesModalNovoProps) {
  const queryClient = useQueryClient();
  const createVersionMutation = useCreateVersion();
  const updateVersionMutation = useUpdateVersion();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const isEditMode = mode === "edit" && Boolean(initialData?.id);
  const isSubmitting =
    createVersionMutation.isPending || updateVersionMutation.isPending;

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
    const trimmed = values.name.trim();
    const body: VersionCreateInput = { name: trimmed };

    const parsed = versionCreateSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.flatten().formErrors[0] ?? "Dados inválidos");
      return;
    }

    try {
      if (isEditMode && initialData?.id) {
        await updateVersionMutation.mutateAsync({
          id: initialData.id,
          input: parsed.data,
        });
        toast.success("Versão atualizada.");
      } else {
        await createVersionMutation.mutateAsync(parsed.data);
        toast.success("Versão cadastrada.");
      }
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-versions"] });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar versão";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-0 space-y-1.5">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
            {isEditMode ? "Editar versão" : "Nova versão"}
          </DialogTitle>
          <p className="text-sm font-semibold text-zinc-400">
            {isEditMode
              ? "Atualize o nome da versão abaixo"
              : "Preencha o nome da versão abaixo"}
          </p>
        </DialogHeader>
        <form onSubmit={onSubmit} className="px-6 pb-8 pt-6 space-y-8">
          <div className="space-y-1.5">
            <Label
              htmlFor="ver-name"
              className="text-sm font-medium text-zinc-900"
            >
              Nome<span className="text-red-500">*</span>
            </Label>
            <Input
              id="ver-name"
              autoComplete="off"
              placeholder="Ex: 6.1.6.0, 7.0.0.0..."
              className="h-11 rounded-lg px-4 border-zinc-200 placeholder:text-zinc-400"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
            <p className="text-xs font-semibold text-zinc-400 pt-0.5">
              Use versionamento semântico (Ex: 6.1.6.0)
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
              className="h-10 rounded-lg px-6 bg-slate-600 hover:bg-slate-700"
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
      </DialogContent>
    </Dialog>
  );
}
