"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CasoFormProvider } from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { useProjetoMemoriaById } from "@/hooks/use-projeto-memoria-by-id";
import { CasoResumoModalContent } from "@/components/caso-resumo-modal/caso-resumo-modal-content";
import {
  formatCaseSearchValue,
  isCaseSearchReady,
} from "@/components/caso-resumo-modal/utils";
import { useCasoProducaoActions } from "@/components/caso-resumo-modal/use-caso-producao-actions";
import { useQueryClient } from "@tanstack/react-query";

const statusFormSchema = z.object({
  status: z.string().optional(),
});

interface CasoResumoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "kanban" | "pesquisa";
  item?: ProjetoMemoriaItem | null;
  initialCaseId?: string | number | null;
}

export function CasoResumoModal({
  open,
  onOpenChange,
  variant,
  item: itemProp,
  initialCaseId,
}: CasoResumoModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");

  const readySearch = isCaseSearchReady(searchValue);
  const searchId = readySearch ? searchValue : null;

  const kanbanShouldFetch =
    variant === "kanban" && open && Boolean(initialCaseId);
  const kanbanQuery = useProjetoMemoriaById(initialCaseId ?? null, {
    enabled: kanbanShouldFetch,
  });

  const searchQuery = useProjetoMemoriaById(searchId, {
    enabled: variant === "pesquisa" && open && readySearch,
  });

  const loadedItem = useMemo(() => {
    if (variant === "kanban") {
      return kanbanQuery.data?.data ?? itemProp ?? null;
    }
    return searchQuery.data?.data ?? null;
  }, [variant, itemProp, searchQuery.data, kanbanQuery.data]);

  const isLoading =
    variant === "kanban"
      ? Boolean(initialCaseId) && kanbanQuery.isLoading
      : readySearch && searchQuery.isLoading;

  const isError =
    variant === "kanban"
      ? Boolean(initialCaseId) && kanbanQuery.isError
      : readySearch && searchQuery.isError;

  const memoriaQueryId = useMemo(() => {
    if (variant === "pesquisa") return searchId ?? "";
    const fromProp = initialCaseId ?? loadedItem?.caso?.id ?? "";
    return String(fromProp);
  }, [variant, searchId, initialCaseId, loadedItem]);

  const statusForm = useForm<{ status?: string }>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: { status: loadedItem?.caso?.status?.status_id ?? "" },
  });

  useEffect(() => {
    statusForm.setValue("status", loadedItem?.caso?.status?.status_id ?? "");
  }, [loadedItem, statusForm]);

  useEffect(() => {
    if (!open || variant !== "pesquisa") return;
    setSearchValue("");
  }, [open, variant]);

  const invalidate = () => {
    if (memoriaQueryId) {
      queryClient.invalidateQueries({
        queryKey: ["projeto-memoria", memoriaQueryId],
      });
    }
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
    queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
  };

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
  });

  const tempoStatus =
    loadedItem?.caso?.tempos?.tempo_status ??
    loadedItem?.caso?.status?.tempo_status;
  const statusTempo =
    loadedItem?.caso?.tempos?.status_tempo ??
    loadedItem?.caso?.status?.status_tempo;
  const showIniciar = tempoStatus === "INICIAR" && statusTempo === "PARADO";
  const showParar = tempoStatus === "PARAR" && statusTempo === "INICIADO";
  const showProducaoButton = variant === "kanban" && (showIniciar || showParar);
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
        <DialogContent className="max-w-[580px] p-0 overflow-hidden max-h-[90vh]">
          <FormProvider {...statusForm}>
            <CasoFormProvider value={providerValue}>
              <div className="bg-card rounded-lg">
                <CasoResumoModalContent
                  variant={variant}
                  item={loadedItem}
                  memoriaQueryId={memoriaQueryId}
                  showEmptyForSearch={variant === "pesquisa" && !readySearch}
                  isLoading={isLoading}
                  isError={isError}
                  searchHeader={
                    variant === "pesquisa" ? (
                      <div className="px-6 pt-8 pb-4 shrink-0 bg-card">
                        <Input
                          value={searchValue}
                          onChange={(e) =>
                            setSearchValue(
                              formatCaseSearchValue(e.target.value),
                            )
                          }
                          maxLength={5}
                          inputMode="numeric"
                          placeholder="Digite o número do caso (5 dígitos)"
                        />
                      </div>
                    ) : null
                  }
                  resultBannerText={
                    variant === "pesquisa" && loadedItem
                      ? `1 caso encontrado para o valor ${searchValue}`
                      : undefined
                  }
                  onStatusUpdated={invalidate}
                  onVerCasoCompleto={() => {
                    const id = loadedItem?.caso?.id;
                    if (!id) return;
                    onOpenChange(false);
                    router.push(`/casos/${id}`);
                  }}
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
        onConfirm={handleConfirmarVisualizarCaso}
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
