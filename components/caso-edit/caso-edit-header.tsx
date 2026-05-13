"use client";

import { Button } from "@/components/ui/button";
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

export interface CasoEditHeaderProps {
  countAnotacoes: number;
  countRelacoes: number;
  countClientes: number;
  countHistorico?: number;
  /** Quantidade de anexos (metadados locais); badge só se maior que 0. */
  countAnexos: number;
  /** Se false, a aba "Anexos" não é exibida (RBAC `list-case-attachment`). */
  showAnexosTab: boolean;
  onClonar: () => void;
  onExcluir: () => void;
  isClonando?: boolean;
  isExcluindo?: boolean;
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

export function CasoEditHeader({
  countAnotacoes,
  countRelacoes,
  countClientes,
  countHistorico,
  countAnexos,
  showAnexosTab,
  onClonar,
  onExcluir,
  isClonando = false,
  isExcluindo = false,
}: CasoEditHeaderProps) {
  const router = useRouter();
  const rbacReady = permissionsLoaded();
  const canDeleteCase = !rbacReady || hasPermission("delete-case");
  const showDeleteTooltip = rbacReady && !canDeleteCase;

  const tabs: TabItem[] = [
    { value: "inicial", label: "Inicial" },
    ...(showAnexosTab
      ? [{ value: "anexos", label: "Anexos", count: countAnexos }]
      : []),
    { value: "anotacoes", label: "Anotações", count: countAnotacoes },
    { value: "historico", label: "Histórico", count: countHistorico },
    { value: "relacoes", label: "Relações", count: countRelacoes },
    { value: "clientes", label: "Clientes", count: countClientes },
    { value: "producao", label: "Produção" },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row gap-6 shrink-0 ">
        {/* Coluna esquerda: mesmo espaço do conteúdo à esquerda do formulário */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <TabsList
            className={cn(
              "w-full max-w-full min-w-0 flex flex-nowrap justify-start items-center gap-0",
              "h-auto min-h-9 overflow-x-auto overflow-y-hidden overscroll-x-contain",
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
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Voltar
        </Button>
        <Button
          type="button"
          variant="outline"
          className=" px-3 flex-1"
          onClick={onClonar}
          disabled={isClonando}
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          {isClonando ? "Clonando..." : "Clonar"}
        </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={onExcluir}
                  disabled={isExcluindo || !canDeleteCase}
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
    </TooltipProvider>
  );
}
