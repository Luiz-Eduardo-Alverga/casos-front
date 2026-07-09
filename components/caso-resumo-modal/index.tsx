"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { useProjetoMemoriaById } from "@/hooks/casos/use-projeto-memoria-by-id";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { CasoResumoModalContent } from "@/components/caso-resumo-modal/caso-resumo-modal-content";
import {
  CASE_ID_MAX_LENGTH,
  CASE_SEARCH_DEBOUNCE_MS,
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
  const [searchInput, setSearchInput] = useState("");
  const [committedSearchId, setCommittedSearchId] = useState<string | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(
    searchInput,
    CASE_SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    if (debouncedSearch !== searchInput) return;

    if (isCaseSearchReady(debouncedSearch)) {
      setCommittedSearchId(debouncedSearch);
    } else {
      setCommittedSearchId(null);
    }
  }, [debouncedSearch, searchInput]);

  const isSearchPending =
    variant === "pesquisa" &&
    isCaseSearchReady(searchInput) &&
    searchInput !== committedSearchId;

  const kanbanShouldFetch =
    variant === "kanban" && open && Boolean(initialCaseId);
  const kanbanQuery = useProjetoMemoriaById(initialCaseId ?? null, {
    enabled: kanbanShouldFetch,
  });

  const searchQuery = useProjetoMemoriaById(committedSearchId, {
    enabled: variant === "pesquisa" && open && Boolean(committedSearchId),
  });

  const loadedItem = useMemo(() => {
    if (variant === "kanban") {
      return kanbanQuery.data?.data ?? itemProp ?? null;
    }
    if (!committedSearchId || searchInput !== committedSearchId) return null;
    return searchQuery.data?.data ?? null;
  }, [
    variant,
    itemProp,
    searchQuery.data,
    kanbanQuery.data,
    committedSearchId,
    searchInput,
  ]);

  const isLoading =
    variant === "kanban"
      ? Boolean(initialCaseId) && kanbanQuery.isLoading
      : isSearchPending ||
        (Boolean(committedSearchId) && searchQuery.isLoading);

  const isError =
    variant === "kanban"
      ? Boolean(initialCaseId) && kanbanQuery.isError
      : Boolean(committedSearchId) &&
        !isSearchPending &&
        searchQuery.isError;
  const queryError =
    variant === "kanban" ? kanbanQuery.error : searchQuery.error;

  const memoriaQueryId = useMemo(() => {
    if (variant === "pesquisa") return committedSearchId ?? "";
    const fromProp = initialCaseId ?? loadedItem?.caso?.id ?? "";
    return String(fromProp);
  }, [variant, committedSearchId, initialCaseId, loadedItem]);

  const statusForm = useForm<{ status?: string }>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: { status: loadedItem?.caso?.status?.status_id ?? "" },
  });

  useEffect(() => {
    statusForm.setValue("status", loadedItem?.caso?.status?.status_id ?? "");
  }, [loadedItem, statusForm]);

  useEffect(() => {
    if (!open || variant !== "pesquisa") return;
    setSearchInput("");
    setCommittedSearchId(null);
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

  const handleVerCasoCompleto = useCallback(() => {
    const id = loadedItem?.caso?.id;
    if (!id) return;
    onOpenChange(false);
    router.push(`/casos/${id}`);
  }, [loadedItem?.caso?.id, onOpenChange, router]);

  const handleSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      if (!isCaseSearchReady(searchInput)) return;

      e.preventDefault();

      if (
        loadedItem &&
        searchInput === String(loadedItem.caso?.id) &&
        !isLoading
      ) {
        handleVerCasoCompleto();
        return;
      }

      setCommittedSearchId(searchInput);
    },
    [searchInput, loadedItem, isLoading, handleVerCasoCompleto],
  );

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
        <DialogContent className="max-h-[90vh] max-w-[580px] min-w-0 overflow-hidden p-0">
          <FormProvider {...statusForm}>
            <CasoFormProvider value={providerValue}>
              <div className="bg-card rounded-lg">
                <CasoResumoModalContent
                  variant={variant}
                  item={loadedItem}
                  memoriaQueryId={memoriaQueryId}
                  showEmptyForSearch={
                    variant === "pesquisa" &&
                    !isCaseSearchReady(searchInput) &&
                    !isSearchPending &&
                    !isLoading
                  }
                  isLoading={isLoading}
                  isError={isError}
                  error={queryError}
                  searchedCaseId={
                    variant === "pesquisa"
                      ? committedSearchId
                      : String(initialCaseId ?? "")
                  }
                  searchHeader={
                    variant === "pesquisa" ? (
                      <div className="px-6 pt-8 pb-4 shrink-0 bg-card">
                        <Input
                          value={searchInput}
                          onChange={(e) =>
                            setSearchInput(
                              formatCaseSearchValue(e.target.value),
                            )
                          }
                          onKeyDown={handleSearchInputKeyDown}
                          maxLength={CASE_ID_MAX_LENGTH}
                          inputMode="numeric"
                          placeholder="Digite o número do caso (mín. 5 dígitos)"
                        />
                      </div>
                    ) : null
                  }
                  resultBannerText={
                    variant === "pesquisa" && loadedItem && committedSearchId
                      ? `1 caso encontrado para o valor ${committedSearchId}`
                      : undefined
                  }
                  onStatusUpdated={invalidate}
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
