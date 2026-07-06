"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { ClientesForm } from "./clientes-form";
import { ClientesTable } from "./clientes-table";
import type { AbaClientesProps, ClientesFormValues } from "./types";
import { useCasoEdit } from "../caso-edit-context";
import { useCreateClienteCaso } from "@/hooks/casos/clientes/use-create-cliente-caso";
import { useDeleteClienteCaso } from "@/hooks/casos/clientes/use-delete-cliente-caso";
import { useClientesProdutosEnderecosUrlPorClientes } from "@/hooks/casos/clientes/use-clientes-produtos-enderecos-url-por-clientes";
import toast from "react-hot-toast";

export function AbaClientes({ clientes, isTabActive = false }: AbaClientesProps) {
  const { numeroCaso, invalidate, canEditCase } = useCasoEdit();
  const queryClient = useQueryClient();
  const createClienteCaso = useCreateClienteCaso();
  const deleteClienteCaso = useDeleteClienteCaso();
  const methods = useForm<ClientesFormValues>({
    defaultValues: {
      clienteId: "",
      clienteSelecionado: undefined,
    },
  });

  const clienteId =
    useWatch({ control: methods.control, name: "clienteId" }) ?? "";
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

  const lista = useMemo(
    () => (Array.isArray(clientes) ? clientes : []),
    [clientes],
  );
  const hasClientes = lista.length > 0;
  const clienteIds = useMemo(
    () => [...new Set(lista.map((c) => c.cliente))],
    [lista],
  );

  const { urlPorCliente, isLoading: isLoadingUrls } =
    useClientesProdutosEnderecosUrlPorClientes({
      clienteIds,
      enabled: isTabActive && hasClientes,
    });

  const invalidateUrls = () => {
    queryClient.invalidateQueries({
      queryKey: ["clientes-produtos-enderecos-url"],
    });
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    setIsDeleting(true);
    try {
      await deleteClienteCaso.mutateAsync(excluirModal.sequencia);
      toast.success("Cliente removido do caso.");
      invalidate();
      invalidateUrls();
      setExcluirModal({ open: false, sequencia: 0 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
        <CasoEditCardHeader
          title="Clientes vinculados"
          icon={CARD_HEADER_PRESETS.clientes.icon}
          iconClassName={CARD_HEADER_PRESETS.clientes.iconClassName}
          badge={numeroCaso}
        />
        <CardContent className="p-6 pt-3 space-y-4 lg:flex-1 ">
          <ClientesForm
            methods={methods}
            isAdding={createClienteCaso.isPending}
            clienteId={clienteId}
            clienteSelecionado={clienteSelecionado}
            onAdd={async (payload) => {
              await createClienteCaso.mutateAsync(payload);
              toast.success("Cliente vinculado com sucesso.");
              invalidate();
              invalidateUrls();
            }}
          />

          <ClientesTable
            clientes={clientes}
            urlPorCliente={urlPorCliente}
            isLoadingUrls={isLoadingUrls}
            canDelete={canEditCase}
            onAskDelete={(sequencia) =>
              setExcluirModal({ open: true, sequencia })
            }
          />
        </CardContent>
      </Card>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Remover cliente do caso"
        descricao="Tem certeza que deseja remover este vínculo? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={isDeleting}
      />
    </FormProvider>
  );
}
