"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { PainelKanbanSkeleton } from "@/components/painel-kanban/layout/painel-kanban-skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import { useAgendaDev } from "@/hooks/painel/use-agenda-dev";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { parseAgendaDevCount } from "@/services/auxiliar/get-agenda-dev";
import { useFinalizarCaso } from "@/hooks/casos/use-finalizar-caso";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { getUser, PAINEL_PRODUTO_ORDEM_KEY } from "@/lib/auth";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { importanceOptions } from "@/mocks/teste";
import {
  columnIdToApiStatus,
  PAINEL_KANBAN_COLUMN_IDS,
  type PainelKanbanColumnId,
} from "@/components/painel-kanban/kanban/painel-kanban-columns";
import {
  dedupePainelKanbanItemsById,
  mapProjetoMemoriaItemToKanban,
  sortAbertosIniciadosPrimeiro,
  type PainelKanbanItem,
} from "@/components/painel-kanban/kanban/painel-kanban-map";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { CasoFormProjeto } from "../fields";

function isColumnId(id: string): id is PainelKanbanColumnId {
  return (PAINEL_KANBAN_COLUMN_IDS as readonly string[]).includes(id);
}

const PAINEL_KANBAN_FILTROS_KEY = "PAINEL_KANBAN_FILTROS";

export function PainelKanban() {
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";
  const nomeColaborador = user?.nome ? String(user.nome) : "";
  const router = useRouter();
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
      projetoLoading: true,
    },
  });

  const { watch, setValue } = methods;
  const produto = watch("produto");
  const versao = watch("versao");
  const devAtribuido = watch("devAtribuido");
  const devAtribuidoLabel = watch("devAtribuidoLabel");
  const projeto = watch("projeto");
  const projetoLoading = Boolean(watch("projetoLoading"));
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

  const usuarioDevId = devAtribuido?.trim() || idColaborador;
  const verComoPlaceholder = devAtribuidoLabel?.trim()
    ? `Ver como: ${devAtribuidoLabel.trim()}`
    : "Ver como: selecione...";

  const isRestoringFiltrosRef = useRef(true);
  const [filtrosRestaurados, setFiltrosRestaurados] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PAINEL_KANBAN_FILTROS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<PainelKanbanFiltrosForm>;

      const savedDev = saved.devAtribuido?.trim();
      setValue("devAtribuido", savedDev ? savedDev : idColaborador);
      if (saved.devAtribuidoLabel?.trim()) {
        setValue("devAtribuidoLabel", saved.devAtribuidoLabel);
      } else {
        setValue("devAtribuidoLabel", nomeColaborador);
      }

      if (saved.devAtribuidoSetor?.trim()) {
        setValue("devAtribuidoSetor", saved.devAtribuidoSetor);
      }

      if (saved.produto?.trim()) setValue("produto", saved.produto);
      if (saved.versao?.trim()) setValue("versao", saved.versao);
      if (saved.projeto?.trim()) setValue("projeto", saved.projeto);
    } catch {
      // Ignora valores inválidos no localStorage.
    } finally {
      isRestoringFiltrosRef.current = false;
      setFiltrosRestaurados(true);
    }
  }, [idColaborador, nomeColaborador, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sub = methods.watch((values) => {
      if (isRestoringFiltrosRef.current) return;

      const payload: PainelKanbanFiltrosForm = {
        produto: values.produto ?? "",
        versao: values.versao ?? "",
        devAtribuido: values.devAtribuido?.trim()
          ? values.devAtribuido
          : idColaborador,
        devAtribuidoLabel: (values.devAtribuidoLabel ?? "").trim()
          ? values.devAtribuidoLabel
          : nomeColaborador,
        devAtribuidoSetor: (values.devAtribuidoSetor ?? "").trim(),
        projeto: (values.projeto ?? "").trim(),
      };

      try {
        localStorage.setItem(
          PAINEL_KANBAN_FILTROS_KEY,
          JSON.stringify(payload),
        );
      } catch {
        // Sem ação: storage pode estar indisponível/cheio.
      }
    });

    return () => sub.unsubscribe();
  }, [idColaborador, nomeColaborador, methods]);

  // Evita 2 chamadas no F5 (primeiro logado, depois restaurado do localStorage):
  // só busca a agenda após concluir a restauração dos filtros.
  const agendaUserId = filtrosRestaurados ? usuarioDevId : "";
  const cronogramaIdAgenda = projeto?.trim() || undefined;
  const { data: agendaDevData, isLoading: isAgendaLoading } = useAgendaDev({
    id_colaborador: agendaUserId,
    Cronograma_id: cronogramaIdAgenda,
  });

  const agendaInitRef = useRef(false);
  const lastUsuarioDevIdRef = useRef<string>("");
  const lastCronogramaIdAgendaRef = useRef<string | null>(null);
  useEffect(() => {
    if (!usuarioDevId) return;
    if (
      lastUsuarioDevIdRef.current &&
      lastUsuarioDevIdRef.current !== usuarioDevId
    ) {
      agendaInitRef.current = false;
    }
    lastUsuarioDevIdRef.current = usuarioDevId;
  }, [usuarioDevId]);

  useEffect(() => {
    const next = projeto?.trim() ?? "";
    if (lastCronogramaIdAgendaRef.current === null) {
      lastCronogramaIdAgendaRef.current = next;
      return;
    }
    if (lastCronogramaIdAgendaRef.current !== next) {
      lastCronogramaIdAgendaRef.current = next;
      agendaInitRef.current = false;
    }
  }, [projeto]);

  useEffect(() => {
    if (!filtrosRestaurados) return;
    if (!agendaDevData?.length || agendaInitRef.current) return;

    const currentProduto = methods.getValues("produto")?.trim();
    const currentVersao = methods.getValues("versao")?.trim();
    const hasValidCurrentSelection = Boolean(
      currentProduto &&
      currentVersao &&
      agendaDevData.some(
        (a) =>
          String(a.id_produto) === currentProduto && a.versao === currentVersao,
      ),
    );
    if (hasValidCurrentSelection) {
      agendaInitRef.current = true;
      return;
    }

    agendaInitRef.current = true;
    const storedOrdem =
      typeof window !== "undefined"
        ? localStorage.getItem(PAINEL_PRODUTO_ORDEM_KEY)
        : null;
    const match = storedOrdem
      ? agendaDevData.find((a) => a.ordem === storedOrdem)
      : agendaDevData[0];
    if (match) {
      setValue("produto", String(match.id_produto));
      setValue("versao", match.versao ?? "");
    }
  }, [agendaDevData, filtrosRestaurados, methods, setValue]);

  useEffect(() => {
    if (!agendaDevData?.length || !produto?.trim() || !versao?.trim()) return;
    const match = agendaDevData.find(
      (a) =>
        String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
    );
    if (match && typeof window !== "undefined") {
      localStorage.setItem(PAINEL_PRODUTO_ORDEM_KEY, match.ordem);
    }
  }, [agendaDevData, produto, versao]);

  // Evita buscar casos com combinação transitória (dev novo + produto/versão antigos).
  // Só habilita quando a seleção atual existe na agenda do dev atual.
  const hasValidAgendaSelection = Boolean(
    agendaDevData?.length &&
    produto?.trim() &&
    versao?.trim() &&
    agendaDevData.some(
      (a) =>
        String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
    ),
  );

  const queryEnabled = Boolean(usuarioDevId && hasValidAgendaSelection);

  const agendaRowForFilters = useMemo(() => {
    if (!agendaDevData?.length || !produto?.trim() || !versao?.trim()) {
      return null;
    }
    return (
      agendaDevData.find(
        (a) =>
          String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
      ) ?? null
    );
  }, [agendaDevData, produto, versao]);

  /** Totais da agenda (API) por coluna; `resolvidos` alinha à coluna concluídos. */
  const columnBadgeCounts = useMemo(():
    | Partial<Record<PainelKanbanColumnId, number>>
    | undefined => {
    if (!agendaRowForFilters) return undefined;
    return {
      abertos: parseAgendaDevCount(agendaRowForFilters.abertos),
      corrigidos: parseAgendaDevCount(agendaRowForFilters.corrigidos),
      retornos: parseAgendaDevCount(agendaRowForFilters.retornos),
      concluidos: parseAgendaDevCount(agendaRowForFilters.resolvidos),
    };
  }, [agendaRowForFilters]);

  const baseParams = {
    per_page: 15,
    usuario_dev_id: usuarioDevId,
    produto_id: produto?.trim() ?? "",
    versao_produto: versao?.trim() ?? "",
  };

  const abertosQ = useProjetoMemoria(
    { ...baseParams, status_id: ["1", "2"], projeto_id: cronogramaIdAgenda },
    { enabled: queryEnabled },
  );
  const corrigidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "3", projeto_id: cronogramaIdAgenda },
    { enabled: queryEnabled },
  );
  const retornosQ = useProjetoMemoria(
    { ...baseParams, status_id: "4", projeto_id: cronogramaIdAgenda },
    { enabled: queryEnabled },
  );
  const concluidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "9", projeto_id: cronogramaIdAgenda },
    { enabled: queryEnabled },
  );

  const abertosItems = useMemo(() => {
    const pages = abertosQ.data?.pages ?? [];
    const raw = pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "abertos")),
    );
    return sortAbertosIniciadosPrimeiro(raw);
  }, [abertosQ.data]);

  const corrigidosItems = useMemo(() => {
    const pages = corrigidosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "corrigidos")),
    );
  }, [corrigidosQ.data]);

  const retornosItems = useMemo(() => {
    const pages = retornosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "retornos")),
    );
  }, [retornosQ.data]);

  const concluidosItems = useMemo(() => {
    const pages = concluidosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "concluidos")),
    );
  }, [concluidosQ.data]);

  const mergedFromApi = useMemo(
    () =>
      dedupePainelKanbanItemsById([
        ...abertosItems,
        ...corrigidosItems,
        ...retornosItems,
        ...concluidosItems,
      ]),
    [abertosItems, corrigidosItems, retornosItems, concluidosItems],
  );

  const [kanbanData, setKanbanData] = useState<PainelKanbanItem[]>([]);
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

  const columnLoad = useMemo(
    () => ({
      abertos: {
        hasNextPage: Boolean(abertosQ.hasNextPage),
        isFetchingNextPage: abertosQ.isFetchingNextPage,
        fetchNextPage: () => void abertosQ.fetchNextPage(),
        isLoading: abertosQ.isLoading,
      },
      corrigidos: {
        hasNextPage: Boolean(corrigidosQ.hasNextPage),
        isFetchingNextPage: corrigidosQ.isFetchingNextPage,
        fetchNextPage: () => void corrigidosQ.fetchNextPage(),
        isLoading: corrigidosQ.isLoading,
      },
      retornos: {
        hasNextPage: Boolean(retornosQ.hasNextPage),
        isFetchingNextPage: retornosQ.isFetchingNextPage,
        fetchNextPage: () => void retornosQ.fetchNextPage(),
        isLoading: retornosQ.isLoading,
      },
      concluidos: {
        hasNextPage: Boolean(concluidosQ.hasNextPage),
        isFetchingNextPage: concluidosQ.isFetchingNextPage,
        fetchNextPage: () => void concluidosQ.fetchNextPage(),
        isLoading: concluidosQ.isLoading,
      },
    }),
    [abertosQ, corrigidosQ, retornosQ, concluidosQ],
  );

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

  if (isAgendaLoading) {
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
            usuarioId={usuarioDevId}
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
                columnBadgeCounts={columnBadgeCounts}
                columnLoad={columnLoad}
              />
            </div>
          )}
        </div>
      </FormProvider>
    </CasoFormProvider>
  );
}
