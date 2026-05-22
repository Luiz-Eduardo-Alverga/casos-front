"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { useCreateSgpUsuario } from "@/hooks/projetos/use-create-sgp-usuario";
import type { SgpUsuarioProjetoItem } from "@/interfaces/sgp-usuario-projeto";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { importanceOptions } from "@/mocks/teste";

const usuarioAutorizadoFormSchema = z.object({
  usuarioId: z.string().min(1, "Selecione um usuário"),
});

type UsuarioAutorizadoFormValues = z.infer<typeof usuarioAutorizadoFormSchema>;

const defaultValues: UsuarioAutorizadoFormValues = {
  usuarioId: "",
};

export interface UsuarioAutorizadoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: number | string;
  usuariosVinculados?: SgpUsuarioProjetoItem[];
}

export function UsuarioAutorizadoFormModal({
  open,
  onOpenChange,
  projetoId,
  usuariosVinculados = [],
}: UsuarioAutorizadoFormModalProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  const form = useForm<UsuarioAutorizadoFormValues>({
    resolver: zodResolver(usuarioAutorizadoFormSchema),
    defaultValues,
  });

  const createUsuario = useCreateSgpUsuario({ projetoId });
  const isSubmitting = createUsuario.isPending;

  const idsVinculados = useMemo(
    () => new Set(usuariosVinculados.map((u) => String(u.usuario))),
    [usuariosVinculados],
  );

  const casoFormProviderValue = useMemo(
    () => ({
      form,
      importanceOptions,
      isDisabled: !canEdit || isSubmitting,
      lazyLoadComboboxOptions: true as const,
    }),
    [form, canEdit, isSubmitting],
  );

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset(defaultValues);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }

    if (idsVinculados.has(String(values.usuarioId))) {
      toast.error("Este usuário já está autorizado neste projeto.");
      return;
    }

    const usuario = Number(values.usuarioId);
    if (Number.isNaN(usuario)) {
      toast.error("Selecione um usuário válido.");
      return;
    }

    try {
      const response = await createUsuario.mutateAsync({
        Registro: Number(projetoId),
        Usuario: usuario,
      });
      toast.success(
        response.message ?? "Usuário autorizado adicionado com sucesso.",
      );
      handleClose(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar usuário autorizado.",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden border-border p-0 sm:max-w-[480px]">
        <DialogHeader className="space-y-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Adicionar usuário autorizado
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Vincule um colaborador que poderá acessar este projeto
          </p>
        </DialogHeader>

        <FormProvider {...form}>
          <CasoFormProvider value={casoFormProviderValue}>
            <div className="space-y-6 px-6 pb-6 pt-6">
              <CasoFormRelator
                name="usuarioId"
                label="Usuário"
                placeholder="Selecione o usuário..."
              />

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
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </CasoFormProvider>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
