"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LayoutGrid, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PainelPageHeader } from "@/components/painel/painel-page-header";
import { PainelKanbanFiltros } from "@/components/painel-kanban/filtros/painel-kanban-filtros";
import { PainelKanbanProdutosModal } from "@/components/painel-kanban/filtros/painel-kanban-produtos-modal";
import { HorasAnaliticasModal } from "@/components/painel-kanban/horas-analiticas-modal";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { PainelKanbanBoard } from "@/components/painel-kanban/kanban/painel-kanban-board";
import { CasoResumoModal } from "@/components/caso-resumo-modal";
import { PainelKanbanSkeleton } from "@/components/painel-kanban/layout/painel-kanban-skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import { useFinalizarCaso } from "@/hooks/casos/use-finalizar-caso";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { getUser } from "@/lib/auth";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { importanceOptions } from "@/mocks/teste";
import {
  columnIdToApiStatus,
  PAINEL_KANBAN_COLUMN_IDS,
  type PainelKanbanColumnId,
} from "@/components/painel-kanban/kanban/painel-kanban-columns";
import type { PainelKanbanItem } from "@/components/painel-kanban/kanban/painel-kanban-map";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { usePainelKanbanFiltros } from "@/components/painel-kanban/hooks/use-painel-kanban-filtros";
import { usePainelKanbanQueries } from "@/components/painel-kanban/hooks/use-painel-kanban-queries";
import { usePainelKanbanProjetosCatalogo } from "@/components/painel-kanban/hooks/use-painel-kanban-projetos-catalogo";

function isColumnId(id: string): id is PainelKanbanColumnId {
  return (PAINEL_KANBAN_COLUMN_IDS as readonly string[]).includes(id);
}

export function PainelKanban() {
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";
  const nomeColaborador = user?.nome ? String(user.nome) : "";
  const queryClient = useQueryClient();
  const updateCaso = useUpdateCaso();
  const finalizarCaso = useFinalizarCaso();

  const methods = useForm<PainelKanbanFiltrosForm>({
    defaultValues: {
      produto: "",
      versao: "",
      devAtribuido: idColaborador,
      devAtribuidoLabel: nomeColaborador,
      devAtribuidoSetor: "",
      projeto: "",
      projetoDataFinal: "",
    },
  });

  const { watch, setValue, getValues } = methods;
  const produto = watch("produto");
  const versao = watch("versao");
  const projeto = watch("projeto");
  const devAtribuidoLabel = watch("devAtribuidoLabel");

  const { hydrated, apiFiltros, usuarioDevId } = usePainelKanbanFiltros({
    methods,
    idColaborador,
    nomeColaborador,
  });

  const {
    agendaDevData,
    isAgendaLoading,
    showKanbanSkeleton,
    queryEnabled,
    agendaRowForFilters,
    columnBadgeCounts,
    columnLoad,
    mergedFromApi,
    cronogramaIdAgenda,
  } = usePainelKanbanQueries({
    apiFiltros,
    hydrated,
    produto: produto ?? "",
    versao: versao ?? "",
    methods,
  });

  const { projetos, isProjetosLoading } = usePainelKanbanProjetosCatalogo(
    apiFiltros,
    hydrated,
  );

  useEffect(() => {
    if (!hydrated || !projeto?.trim() || !projetos?.length) return;
    const found = projetos.find((p) => String(p.id) === projeto.trim());
    if (!found) return;
    const dataFinal = found.data_final?.trim() ?? "";
    if (String(getValues("projetoDataFinal") ?? "") === dataFinal) return;
    setValue("projetoDataFinal", dataFinal, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [getValues, hydrated, projeto, projetos, setValue]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
      lazyLoadComboboxOptions: true,
    }),
    [methods, produto],
  );

  const verComoPlaceholder = devAtribuidoLabel?.trim()
    ? `Ver como: ${devAtribuidoLabel.trim()}`
    : "Ver como: selecione...";

  const [kanbanData, setKanbanData] = useState<PainelKanbanItem[]>([]);
  const [openResumo, setOpenResumo] = useState(false);
  const [itemSelecionado, setItemSelecionado] =
    useState<PainelKanbanItem | null>(null);
  const [isProdutosModalOpen, setIsProdutosModalOpen] = useState(false);
  const [isHorasAnaliticasOpen, setIsHorasAnaliticasOpen] = useState(false);

  useEffect(() => {
    setKanbanData(mergedFromApi);
  }, [mergedFromApi]);

  const kanbanDataRef = useRef(kanbanData);
  kanbanDataRef.current = kanbanData;

  const columnDragStartRef = useRef<string>("");

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    const row = kanbanDataRef.current.find((i) => i.id === id);
    columnDragStartRef.current = row?.column ?? "";
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromCol = columnDragStartRef.current;
      const dataNow = kanbanDataRef.current;
      const overItem = dataNow.find((i) => i.id === overId);
      const targetCol: PainelKanbanColumnId | null = overItem
        ? (overItem.column as PainelKanbanColumnId)
        : isColumnId(overId)
          ? overId
          : null;
      if (!targetCol || !fromCol || fromCol === targetCol) {
        return;
      }

      const invalidateKanban = () => {
        queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
        queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
      };

      const deveFinalizarCaso =
        targetCol === "corrigidos" &&
        (fromCol === "abertos" || fromCol === "retornos");

      if (deveFinalizarCaso) {
        finalizarCaso.mutate(activeId, {
          onSuccess: (res) => {
            toast.success(res.message ?? "Caso finalizado com sucesso.");
            invalidateKanban();
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Erro ao finalizar caso.",
            );
            invalidateKanban();
          },
        });
        return;
      }

      const status = columnIdToApiStatus(targetCol);
      updateCaso.mutate(
        { id: activeId, data: { status } },
        {
          onSuccess: () => {
            toast.success("Status atualizado com sucesso.");
            invalidateKanban();
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Erro ao atualizar status.",
            );
            invalidateKanban();
          },
        },
      );
    },
    [queryClient, updateCaso, finalizarCaso],
  );

  const colaboradorModalLabel =
    devAtribuidoLabel?.trim() || nomeColaborador || "Não informado";
  const projetoModalId = String(
    agendaRowForFilters?.Cronograma_id ?? "",
  ).trim();
  const projetoModalLabel = projetoModalId || "Não informado";
  const produtoModalId = produto?.trim() || "";
  const produtoModalLabel =
    agendaRowForFilters?.produto?.trim() || "Não informado";

  if (!idColaborador) {
    return (
      <div className="px-6 pt-20 py-10 flex-1 flex flex-col overflow-x-hidden">
        <PainelPageHeader />
        <EmptyState
          icon={LayoutGrid}
          title="Sessão inválida"
          description="Não foi possível identificar o colaborador logado."
        />
      </div>
    );
  }

  if (showKanbanSkeleton) {
    return <PainelKanbanSkeleton />;
  }

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <div className="px-6 pt-20 py-5 flex-1 flex flex-col overflow-x-hidden lg:min-h-0 lg:overflow-hidden">
          <PainelPageHeader
            onHorasAnaliticas={() => setIsHorasAnaliticasOpen(true)}
            isLoading={isAgendaLoading}
            actionSlot={
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <CasoFormDevAtribuido
                  required={false}
                  requireProduto={false}
                  label="Ver como"
                  placeholder={verComoPlaceholder}
                  valueLabelPrefix="Ver como: "
                  hideLabel
                  setorName="devAtribuidoSetor"
                  wrapperClassName="w-full sm:w-[220px] h-full"
                  controlHeightClassName="h-[42px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateCaso.isPending}
                  onClick={() => setIsProdutosModalOpen(true)}
                  className="w-full sm:w-auto px-4 flex-1 sm:flex-initial bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground/90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar visão geral
                </Button>
              </div>
            }
          />

          <PainelKanbanFiltros
            agendaItems={agendaDevData ?? []}
            projetos={projetos}
            projetosLoading={isProjetosLoading}
          />

          <PainelKanbanProdutosModal
            open={isProdutosModalOpen}
            onOpenChange={setIsProdutosModalOpen}
            idColaborador={usuarioDevId}
            nomeColaborador={nomeColaborador}
          />

          <HorasAnaliticasModal
            open={isHorasAnaliticasOpen}
            onOpenChange={setIsHorasAnaliticasOpen}
            produtoId={produtoModalId}
            produtoLabel={produtoModalLabel}
            colaboradorLabel={colaboradorModalLabel}
            projetoId={cronogramaIdAgenda ?? ""}
            projetoLabel={projetoModalLabel}
            usuarioId={usuarioDevId}
          />

          {!queryEnabled ? (
            <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
              <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5 text-text-primary" />
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    Quadro Kanban
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                <EmptyState
                  icon={LayoutGrid}
                  title="Selecione produto e versão"
                  description="Escolha o produto, o responsável e a versão nos filtros acima para carregar os casos no quadro."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden gap-2">
              <PainelKanbanBoard
                data={kanbanData}
                onDataChange={setKanbanData}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onExpand={(selected) => {
                  setItemSelecionado(selected);
                  setOpenResumo(true);
                }}
                columnBadgeCounts={columnBadgeCounts}
                columnLoad={columnLoad}
              />
            </div>
          )}

          <CasoResumoModal
            open={openResumo}
            onOpenChange={setOpenResumo}
            variant="kanban"
            initialCaseId={itemSelecionado?.id}
          />
        </div>
      </FormProvider>
    </CasoFormProvider>
  );
}
