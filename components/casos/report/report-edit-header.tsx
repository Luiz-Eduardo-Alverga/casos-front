"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
import { useCasoEdit } from "@/components/casos/edicao/caso-edit-context";

export interface ReportEditHeaderProps {
  countAnotacoes: number;
  countRelacoes: number;
  countClientes: number;
  countHistorico?: number;
  countAnexos: number;
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

export function ReportEditHeader({
  countAnotacoes,
  countRelacoes,
  countClientes,
  countHistorico,
  countAnexos,
  showAnexosTab,
}: ReportEditHeaderProps) {
  const router = useRouter();
  const { memoriaQueryId, invalidate } = useCasoEdit();
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

  const handleVoltar = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/painel");
  };

  const handleClonar = async () => {
    try {
      const res = await clonarCaso.mutateAsync(Number(memoriaQueryId));
      toast.success(res.message ?? "Report clonado com sucesso.");
      invalidate();
      if (res?.data?.registro) {
        router.push(`/casos/${res.data.registro}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao clonar report.");
    }
  };

  const handleExcluirCaso = async () => {
    try {
      await deleteCaso.mutateAsync(Number(memoriaQueryId));
      toast.success("Report excluído com sucesso.");
      invalidate();
      handleVoltar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir report.");
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
          "flex shrink-0 flex-col gap-6 lg:flex-row",
          isPinned &&
            "fixed z-20 bg-white px-6 py-2 shadow-sm border-b border-border/40 transition-[left,width] duration-300",
        )}
        style={pinnedStyle}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TabsList
            className={cn(
              "w-full max-w-full min-w-0 flex flex-nowrap justify-start items-center gap-0",
              "h-auto min-h-9 overflow-x-auto overflow-y-hidden overscroll-x-contain",
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

        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 lg:w-[312px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-destructive/30 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setExcluirCasoModal(true)}
                  disabled={deleteCaso.isPending || !canDeleteCase}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Excluir
                </Button>
              </span>
            </TooltipTrigger>
            {showDeleteTooltip && (
              <TooltipContent>
                Você não possui permissão para excluir este report.
              </TooltipContent>
            )}
          </Tooltip>
          <Button
            type="button"
            variant="outline"
            className="flex-1 px-3"
            onClick={handleClonar}
            disabled={clonarCaso.isPending}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            {clonarCaso.isPending ? "Clonando..." : "Clonar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 px-3"
            onClick={handleVoltar}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Voltar
          </Button>
        </div>
      </div>

      <ConfirmacaoModal
        open={excluirCasoModal}
        onOpenChange={setExcluirCasoModal}
        titulo="Excluir report"
        descricao="Tem certeza que deseja excluir este report? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirCaso}
        variant="danger"
        isLoading={deleteCaso.isPending}
      />
    </TooltipProvider>
  );
}
