"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { useProjetoMemoriaById } from "@/hooks/casos/use-projeto-memoria-by-id";
import { CasoResumoModalContent } from "@/components/caso-resumo-modal/caso-resumo-modal-content";
import { useCasoProducaoActions } from "@/components/caso-resumo-modal/use-caso-producao-actions";
import { useQueryClient } from "@tanstack/react-query";

const statusFormSchema = z.object({
  status: z.string().optional(),
});

interface CasoResumoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ProjetoMemoriaItem | null;
  initialCaseId?: string | number | null;
}

export function CasoResumoModal({
  open,
  onOpenChange,
  item: itemProp,
  initialCaseId,
}: CasoResumoModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const shouldFetch = open && Boolean(initialCaseId);
  const kanbanQuery = useProjetoMemoriaById(initialCaseId ?? null, {
    enabled: shouldFetch,
  });

  const loadedItem = kanbanQuery.data?.data ?? itemProp ?? null;
  const isLoading = Boolean(initialCaseId) && kanbanQuery.isLoading;
  const isError = Boolean(initialCaseId) && kanbanQuery.isError;
  const queryError = kanbanQuery.error;

  const memoriaQueryId = useMemo(() => {
    const fromProp = initialCaseId ?? loadedItem?.caso?.id ?? "";
    return String(fromProp);
  }, [initialCaseId, loadedItem]);

  const statusForm = useForm<{ status?: string }>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: { status: loadedItem?.caso?.status?.status_id ?? "" },
  });

  useEffect(() => {
    statusForm.setValue("status", loadedItem?.caso?.status?.status_id ?? "");
  }, [loadedItem, statusForm]);

  const invalidate = () => {
    if (memoriaQueryId) {
      queryClient.invalidateQueries({
        queryKey: ["projeto-memoria", memoriaQueryId],
      });
    }
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
    queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
  };

  const handleVerCasoCompleto = useCallback(() => {
    const id = loadedItem?.caso?.id;
    if (!id) return;
    onOpenChange(false);
    router.push(`/casos/${id}`);
  }, [loadedItem?.caso?.id, onOpenChange, router]);

  const handleRedirecionarParaAbaProducao = useCallback(() => {
    const id = loadedItem?.caso?.id ?? memoriaQueryId;
    if (!id) return;

    onOpenChange(false);
    router.push(`/casos/${id}?tab=producao`);
  }, [loadedItem?.caso?.id, memoriaQueryId, onOpenChange, router]);

  const {
    iniciarProducao,
    pararProducao,
    handleIniciar,
    handleParar,
    casoAbertoModalOpen,
    setCasoAbertoModalOpen,
    setCasoAbertoId,
    tempoEstimadoModalOpen,
    setTempoEstimadoModalOpen,
    handleConfirmarVisualizarCaso,
    handleIrParaAbaProducao,
  } = useCasoProducaoActions({
    casoId: memoriaQueryId || loadedItem?.caso?.id || "",
    onProducaoAlterada: invalidate,
    onRedirecionarParaAbaProducao: handleRedirecionarParaAbaProducao,
  });

  const tempoStatus =
    loadedItem?.caso?.tempos?.tempo_status ??
    loadedItem?.caso?.status?.tempo_status;
  const statusTempo =
    loadedItem?.caso?.tempos?.status_tempo ??
    loadedItem?.caso?.status?.status_tempo;
  const showIniciar = tempoStatus === "INICIAR" && statusTempo === "PARADO";
  const showParar = tempoStatus === "PARAR" && statusTempo === "INICIADO";
  const showProducaoButton = showIniciar || showParar;
  const hasAnotations =
    loadedItem?.caso.anotacoes && loadedItem?.caso.anotacoes.length > 0;

  const providerValue = useMemo(
    () => ({
      form: statusForm,
      importanceOptions,
      produto: String(loadedItem?.produto?.id ?? ""),
      isDisabled: false,
      lazyLoadComboboxOptions: true as const,
      editCaseItem: loadedItem ?? undefined,
    }),
    [statusForm, loadedItem],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">Caso Resumo</DialogTitle>
        <DialogContent className="max-h-[90vh] max-w-[580px] min-w-0 overflow-hidden p-0">
          <FormProvider {...statusForm}>
            <CasoFormProvider value={providerValue}>
              <div className="bg-card rounded-lg">
                <CasoResumoModalContent
                  item={loadedItem}
                  memoriaQueryId={memoriaQueryId}
                  isLoading={isLoading}
                  isError={isError}
                  error={queryError}
                  searchedCaseId={String(initialCaseId ?? "")}
                  onVerCasoCompleto={handleVerCasoCompleto}
                  showProducaoButton={showProducaoButton}
                  onAcaoProducao={showIniciar ? handleIniciar : handleParar}
                  producaoMode={showIniciar ? "iniciar" : "parar"}
                  producaoIsPending={
                    showIniciar
                      ? iniciarProducao.isPending
                      : pararProducao.isPending
                  }
                  producaoDisabled={
                    iniciarProducao.isPending ||
                    pararProducao.isPending ||
                    !showProducaoButton
                  }
                  hasAnotations={hasAnotations}
                  onBeforeNavigate404={() => onOpenChange(false)}
                />
              </div>
            </CasoFormProvider>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <ConfirmacaoModal
        open={casoAbertoModalOpen}
        onOpenChange={(nextOpen) => {
          setCasoAbertoModalOpen(nextOpen);
          if (!nextOpen) setCasoAbertoId(null);
        }}
        titulo="Caso em produção"
        descricao="Já existe um caso em produção. Deseja visualizar o caso aberto?"
        confirmarLabel="Visualizar caso"
        cancelarLabel="Cancelar"
        onConfirm={() => {
          handleConfirmarVisualizarCaso();
          onOpenChange(false);
        }}
      />

      <ConfirmacaoModal
        open={tempoEstimadoModalOpen}
        onOpenChange={setTempoEstimadoModalOpen}
        titulo="Planejamento necessário"
        descricao="Este caso ainda não possui um tempo estimado. Deseja lançar uma estimativa ou marcar como não planejado?"
        confirmarLabel="Ir para aba Produção"
        cancelarLabel="Cancelar"
        onConfirm={handleIrParaAbaProducao}
      />
    </>
  );
}
