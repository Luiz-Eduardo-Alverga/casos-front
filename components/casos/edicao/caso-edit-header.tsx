"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  appendStandaloneToCasoPath,
  isCasoStandaloneMode,
} from "@/lib/caso-standalone-url";
import { useRouter, useSearchParams } from "next/navigation";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useClonarCaso } from "@/hooks/casos/use-clonar-caso";
import { useDeleteCaso } from "@/hooks/casos/use-delete-caso";
import { useCasoEdit } from "./caso-edit-context";

export interface CasoEditHeaderProps {
  countAnotacoes: number;
  countRelacoes: number;
  countClientes: number;
  countHistorico?: number;
  /** Quantidade de anexos (metadados locais); badge só se maior que 0. */
  countAnexos: number;
  /** Se false, a aba "Anexos" não é exibida (RBAC `list-case-attachment`). */
  showAnexosTab: boolean;
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
}: CasoEditHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const standalone = isCasoStandaloneMode(searchParams);
  const { memoriaQueryId, invalidate, canEditCase } = useCasoEdit();
  const clonarCaso = useClonarCaso();
  const deleteCaso = useDeleteCaso();
  const [excluirCasoModal, setExcluirCasoModal] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const rbacReady = permissionsLoaded();
  const canDeleteCase = !rbacReady || hasPermission("delete-case");
  const showDeleteTooltip = rbacReady && !canDeleteCase;

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
  }, [isMobile, showAnexosTab]);

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
            "fixed z-20 bg-white px-6 py-2 shadow-sm border-b border-border/40 transition-[left,width] duration-300",
        )}
        style={pinnedStyle}
      >
        {/* Coluna esquerda: mesmo espaço do conteúdo à esquerda do formulário */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TabsList
            className={cn(
              "w-full max-w-full min-w-0 flex flex-nowrap justify-start items-center gap-0",
              "h-9 overflow-x-auto overflow-y-hidden overscroll-x-contain",
              // Scroll funciona, mas barra não aparece (Chrome/Safari/Edge/Firefox/IE)
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "rounded-full bg-white py-1 text-muted-foreground",
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

        {/* Coluna direita: mesmo espaço da coluna direita do formulário (362px em lg) */}
        <div className="w-full lg:w-[362px] flex flex-row items-center justify-between gap-2 shrink-0 ">
          <Button
            type="button"
            variant="outline"
            className=" px-3 flex-1"
            onClick={() =>
              standalone ? tryCloseTabOrIrCasos() : router.back()
            }
          >
            {standalone ? (
              <>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Fechar
              </>
            ) : (
              <>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Voltar
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className=" px-3 flex-1"
            onClick={handleClonar}
            disabled={clonarCaso.isPending || !canEditCase}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            {clonarCaso.isPending ? "Clonando..." : "Clonar"}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setExcluirCasoModal(true)}
                  disabled={
                    deleteCaso.isPending || !canDeleteCase || !canEditCase
                  }
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Excluir
                </Button>
              </span>
            </TooltipTrigger>
            {showDeleteTooltip && (
              <TooltipContent>
                Você não possui permissão para excluir este caso.
              </TooltipContent>
            )}
          </Tooltip>
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
    </TooltipProvider>
  );
}
