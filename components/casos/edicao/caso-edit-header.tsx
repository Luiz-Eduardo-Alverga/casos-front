"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Copy,
  Loader2,
  MoreHorizontal,
  Save,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  appendStandaloneToCasoPath,
  isCasoStandaloneMode,
} from "@/lib/caso-standalone-url";
import { useRouter, useSearchParams } from "next/navigation";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useClonarCaso } from "@/hooks/casos/use-clonar-caso";
import { useDeleteCaso } from "@/hooks/casos/use-delete-caso";
import { useCreateTicket } from "@/hooks/tickets/use-create-ticket";
import { getUser } from "@/lib/auth";
import { getUsuarios } from "@/services/auxiliar/usuarios";
import type {
  AnotacaoCasoItem,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import { useCasoProducaoActions } from "@/components/caso-resumo-modal/use-caso-producao-actions";
import { CasoProducaoActionButton } from "@/components/caso-resumo-modal/caso-producao-action-button";
import { useCasoEdit } from "./caso-edit-context";
import {
  buildCreateTicketPayload,
  findUsuarioIdByNome,
  getClienteIdsVinculados,
  getUltimaAnotacao,
} from "./abrir-ocorrencia-utils";

export interface CasoEditHeaderProps {
  countAnotacoes: number;
  countRelacoes: number;
  countClientes: number;
  countHistorico?: number;
  /** Quantidade de anexos (metadados locais); badge só se maior que 0. */
  countAnexos: number;
  /** Se false, a aba "Anexos" não é exibida (RBAC `list-case-attachment`). */
  showAnexosTab: boolean;
  tempoStatus?: string;
  statusTempo?: string;
  onRedirecionarParaAbaProducao?: () => void;
  clientes?: ClienteCasoItem[];
  descricaoResumo?: string | null;
  anotacoes?: AnotacaoCasoItem[];
  /** Nome em `report.responsavel_feedback_nome` — usado para resolver suporteId. */
  responsavelFeedbackNome?: string | null;
}

const TAB_TRIGGER_CLASS = cn(
  "group shrink-0 rounded-full px-3 py-1.5 text-sm font-medium gap-1.5",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
);

const BADGE_CLASS = cn(
  "inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums",
  "bg-primary text-white",
  "group-data-[state=active]:bg-brand-yellow group-data-[state=active]:text-primary-foreground",
);

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

const APP_HEADER_HEIGHT = 60;

export function CasoEditHeader({
  countAnotacoes,
  countRelacoes,
  countClientes,
  countHistorico,
  countAnexos,
  showAnexosTab,
  tempoStatus,
  statusTempo,
  onRedirecionarParaAbaProducao,
  clientes,
  descricaoResumo,
  anotacoes,
  responsavelFeedbackNome,
}: CasoEditHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const standalone = isCasoStandaloneMode(searchParams);
  const {
    memoriaQueryId,
    numeroCaso,
    invalidate,
    canEditCase,
    isSaving,
    onSalvar,
    statusIdApi,
  } = useCasoEdit();
  const clonarCaso = useClonarCaso();
  const deleteCaso = useDeleteCaso();
  const createTicket = useCreateTicket();
  const [excluirCasoModal, setExcluirCasoModal] = useState(false);
  const [semClienteModal, setSemClienteModal] = useState(false);
  const [abrindoOcorrencia, setAbrindoOcorrencia] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const rbacReady = permissionsLoaded();
  const canDeleteCase = !rbacReady || hasPermission("delete-case");

  const disabled = isSaving || !canEditCase;
  const showIniciar = tempoStatus === "INICIAR" && statusTempo === "PARADO";
  const showParar = tempoStatus === "PARAR" && statusTempo === "INICIADO";

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
    casoId: numeroCaso,
    onProducaoAlterada: invalidate,
    onRedirecionarParaAbaProducao,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const measure = () => setHeaderHeight(header.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isMobile, showAnexosTab, showIniciar, showParar]);

  useEffect(() => {
    const onScroll = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      setIsPinned(sentinel.getBoundingClientRect().top < APP_HEADER_HEIGHT);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pinnedStyle = isPinned
    ? {
        top: `${APP_HEADER_HEIGHT}px`,
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }
    : undefined;

  const tryCloseTabOrIrCasos = () => {
    window.close();
    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        router.push("/casos");
      }
    }, 200);
  };

  const handleClonar = async () => {
    try {
      const res = await clonarCaso.mutateAsync(Number(memoriaQueryId));
      toast.success(res.message ?? "Caso clonado com sucesso.");
      invalidate();
      if (res?.data?.registro) {
        const path = `/casos/${res.data.registro}`;
        router.push(standalone ? appendStandaloneToCasoPath(path) : path);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao clonar caso.");
    }
  };

  const handleExcluirCaso = async () => {
    try {
      await deleteCaso.mutateAsync(Number(memoriaQueryId));
      toast.success("Caso excluído com sucesso.");
      invalidate();
      if (standalone) {
        tryCloseTabOrIrCasos();
      } else {
        router.back();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir caso.");
    }
  };

  const canAbrirOcorrencia = statusIdApi === 8;

  const handleAbrirOcorrencia = async () => {
    const clienteIds = getClienteIdsVinculados(clientes);
    if (clienteIds.length === 0) {
      setSemClienteModal(true);
      return;
    }

    const user = getUser();
    const atendente = user?.nome?.trim();
    if (!atendente) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const nomeFeedback = responsavelFeedbackNome?.trim();
    if (!nomeFeedback) {
      toast.error("Responsável de feedback não informado no caso.");
      return;
    }

    const ultima = getUltimaAnotacao(anotacoes);
    setAbrindoOcorrencia(true);
    let sucesso = 0;
    let falhas = 0;

    try {
      const usuarios = await getUsuarios({
        search: nomeFeedback,
        somente_projetos: false,
      });
      const suporte = findUsuarioIdByNome(usuarios, nomeFeedback);
      if (suporte == null) {
        toast.error(
          `Usuário "${nomeFeedback}" não encontrado para preencher o suporte.`,
        );
        return;
      }

      for (const clienteId of clienteIds) {
        try {
          await createTicket.mutateAsync(
            buildCreateTicketPayload({
              clienteId,
              casoId: numeroCaso,
              descricaoResumo,
              ultimaAnotacaoTexto: ultima?.anotacoes,
              atendente,
              suporteId: suporte,
            }),
          );
          sucesso += 1;
        } catch {
          falhas += 1;
        }
      }

      if (falhas === 0) {
        toast.success(
          sucesso === 1
            ? "Ocorrência aberta com sucesso."
            : `${sucesso} ocorrências abertas com sucesso.`,
        );
      } else if (sucesso === 0) {
        toast.error("Não foi possível abrir a ocorrência.");
      } else {
        toast.error(
          `${sucesso} ocorrência(s) aberta(s), ${falhas} falha(s).`,
        );
      }
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Erro ao buscar usuário do responsável de feedback.",
      );
    } finally {
      setAbrindoOcorrencia(false);
    }
  };

  const tabs: TabItem[] = [
    { value: "inicial", label: "Inicial" },
    { value: "anotacoes", label: "Anotações", count: countAnotacoes },
    ...(showAnexosTab
      ? [{ value: "anexos", label: "Anexos", count: countAnexos }]
      : []),
    { value: "clientes", label: "Clientes", count: countClientes },
    { value: "relacoes", label: "Relações", count: countRelacoes },
    { value: "producao", label: "Produção" },
    { value: "historico", label: "Histórico", count: countHistorico },
  ];

  return (
    <TooltipProvider>
      <div ref={sentinelRef} className="h-0 shrink-0" aria-hidden />

      {isPinned && headerHeight > 0 && (
        <div
          className="shrink-0"
          style={{ height: headerHeight }}
          aria-hidden
        />
      )}

      <div
        ref={headerRef}
        className={cn(
          "flex shrink-0 flex-col gap-2 lg:flex-row",
          isPinned &&
            "fixed z-20 bg-card px-6 py-2 shadow-sm border-b border-border/40 transition-[left,width] duration-300",
        )}
        style={pinnedStyle}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TabsList
            className={cn(
              "w-full max-w-full min-w-0 flex flex-nowrap justify-start items-center gap-0",
              "h-9 overflow-x-auto overflow-y-hidden overscroll-x-contain",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "rounded-full bg-card py-1 text-muted-foreground",
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={TAB_TRIGGER_CLASS}
              >
                {tab.label}
                {tab.count !== undefined && tab.count >= 1 && (
                  <span className={BADGE_CLASS}>{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex w-full shrink-0 flex-row items-center gap-1.5 lg:w-[362px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="Mais ações"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => void handleClonar()}
                disabled={clonarCaso.isPending || !canEditCase}
              >
                <Copy className="h-4 w-4 mr-2" />
                {clonarCaso.isPending ? "Clonando..." : "Clonar"}
              </DropdownMenuItem>
              {canAbrirOcorrencia ? (
                <DropdownMenuItem
                  onClick={() => void handleAbrirOcorrencia()}
                  disabled={abrindoOcorrencia || createTicket.isPending}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  {abrindoOcorrencia ? "Abrindo..." : "Abrir ocorrência"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => setExcluirCasoModal(true)}
                disabled={
                  deleteCaso.isPending || !canDeleteCase || !canEditCase
                }
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-0 flex-1 px-2"
            onClick={() =>
              standalone ? tryCloseTabOrIrCasos() : router.back()
            }
          >
            {standalone ? (
              <>
                <X className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Fechar</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Voltar</span>
              </>
            )}
          </Button>

          {showIniciar ? (
            <CasoProducaoActionButton
              mode="iniciar"
              onClick={handleIniciar}
              disabled={disabled}
              isPending={iniciarProducao.isPending}
              className="h-9 min-w-0 flex-1 px-2"
            />
          ) : null}

          {showParar ? (
            <CasoProducaoActionButton
              mode="parar"
              onClick={handleParar}
              disabled={disabled}
              isPending={pararProducao.isPending}
              className="h-9 min-w-0 flex-1 px-2"
            />
          ) : null}

          <Button
            type="button"
            onClick={onSalvar}
            disabled={disabled}
            className="h-9 min-w-0 flex-1 px-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin " />
                <span className="truncate">Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 shrink-0 " />
                <span className="truncate">Salvar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <ConfirmacaoModal
        open={excluirCasoModal}
        onOpenChange={setExcluirCasoModal}
        titulo="Excluir caso"
        descricao="Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirCaso}
        variant="danger"
        isLoading={deleteCaso.isPending}
      />

      <ConfirmacaoModal
        open={semClienteModal}
        onOpenChange={setSemClienteModal}
        titulo="Cliente necessário"
        descricao="É necessário ter pelo menos 1 cliente vinculado ao caso para abrir uma ocorrência."
        confirmarLabel="Entendi"
        cancelarLabel="Fechar"
        onConfirm={() => undefined}
      />

      <ConfirmacaoModal
        open={casoAbertoModalOpen}
        onOpenChange={(open) => {
          setCasoAbertoModalOpen(open);
          if (!open) {
            setCasoAbertoId(null);
          }
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
    </TooltipProvider>
  );
}
