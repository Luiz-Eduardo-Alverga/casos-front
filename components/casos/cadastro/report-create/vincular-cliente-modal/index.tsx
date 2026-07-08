"use client";

import { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useCreateClienteCaso } from "@/hooks/casos/clientes/use-create-cliente-caso";
import { useDeleteClienteCaso } from "@/hooks/casos/clientes/use-delete-cliente-caso";
import { useClientesProdutosEnderecosUrlPorClientes } from "@/hooks/casos/clientes/use-clientes-produtos-enderecos-url-por-clientes";
import { useProjetoMemoriaById } from "@/hooks/casos/use-projeto-memoria-by-id";
import { VincularClienteForm } from "./vincular-cliente-form";
import { VincularClienteEmptyState } from "./vincular-cliente-empty-state";
import { VincularClienteList } from "./vincular-cliente-list";
import type { VincularClienteFormValues, VincularClienteModalProps } from "./types";

export function VincularClienteModal({
  open,
  onOpenChange,
  registro,
  onConcluido,
}: VincularClienteModalProps) {
  const queryClient = useQueryClient();
  const createClienteCaso = useCreateClienteCaso();
  const deleteClienteCaso = useDeleteClienteCaso();

  const methods = useForm<VincularClienteFormValues>({
    defaultValues: {
      clienteId: "",
      clienteSelecionado: undefined,
    },
  });

  const clienteId = useWatch({ control: methods.control, name: "clienteId" }) ?? "";
  const clienteSelecionado =
    useWatch({ control: methods.control, name: "clienteSelecionado" }) ??
    undefined;

  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({
    open: false,
    sequencia: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: casoData } = useProjetoMemoriaById(registro, {
    enabled: open && registro != null,
  });

  const clientes = useMemo(
    () => casoData?.data?.caso?.clientes ?? [],
    [casoData?.data?.caso?.clientes],
  );
  const hasClientes = clientes.length > 0;
  const isBlocked = !hasClientes;

  const clienteIds = useMemo(
    () => [...new Set(clientes.map((c) => c.cliente))],
    [clientes],
  );

  const { urlPorCliente, isLoading: isLoadingUrls } =
    useClientesProdutosEnderecosUrlPorClientes({
      clienteIds,
      enabled: open && hasClientes,
    });

  const invalidateClientes = () => {
    if (registro == null) return;
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria", registro] });
    queryClient.invalidateQueries({
      queryKey: ["clientes-produtos-enderecos-url"],
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBlocked) return;
    onOpenChange(nextOpen);
  };

  const handleAdd = async (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => {
    try {
      await createClienteCaso.mutateAsync(payload);
      toast.success("Cliente vinculado com sucesso.");
      invalidateClientes();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao vincular cliente ao report.",
      );
      throw error;
    }
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    setIsDeleting(true);
    try {
      await deleteClienteCaso.mutateAsync(excluirModal.sequencia);
      toast.success("Cliente removido do report.");
      invalidateClientes();
      setExcluirModal({ open: false, sequencia: 0 });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao remover cliente do report.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConcluir = () => {
    if (!hasClientes) return;
    onConcluido();
  };

  if (registro == null) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`flex w-[calc(100vw-1rem)] max-w-[900px] flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl sm:w-[min(96vw,900px)] ${isBlocked ? "[&>button:last-child]:hidden" : ""}`}
          onPointerDownOutside={(event) => {
            if (isBlocked) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isBlocked) event.preventDefault();
          }}
        >
          <DialogHeader className="border-b border-border-divider px-5 pb-5 pt-5 text-left sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Users
                  className="h-4 w-4 text-primary-foreground"
                  aria-hidden
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold leading-tight text-text-primary">
                  Vincular Cliente
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary">
                  É obrigatório vincular pelo menos um cliente para abrir o
                  report.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <FormProvider {...methods}>
              <VincularClienteForm
                registro={registro}
                isAdding={createClienteCaso.isPending}
                clienteId={clienteId}
                clienteSelecionado={clienteSelecionado}
                onAdd={handleAdd}
              />
            </FormProvider>

            {hasClientes ? (
              <VincularClienteList
                clientes={clientes}
                urlPorCliente={urlPorCliente}
                isLoadingUrls={isLoadingUrls}
                onAskDelete={(sequencia) =>
                  setExcluirModal({ open: true, sequencia })
                }
              />
            ) : (
              <VincularClienteEmptyState />
            )}
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-border-divider bg-card px-5 py-4 sm:px-6">
            <Button
              type="button"
              onClick={handleConcluir}
              disabled={!hasClientes}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Concluir vinculação de clientes"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Concluir
            </Button>
          </footer>
        </DialogContent>
      </Dialog>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(nextOpen) =>
          !nextOpen && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Remover cliente do report"
        descricao="Tem certeza que deseja remover este vínculo? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
