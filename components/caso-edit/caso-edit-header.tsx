"use client";

import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface CasoEditHeaderProps {
  casoId: string;
  numeroCaso: number;
  countAnotacoes: number;
  countRelacoes: number;
  countClientes: number;
  tabValue: string;
  onTabChange: (value: string) => void;
  onClonar: () => void;
  onExcluir: () => void;
  isClonando?: boolean;
  isExcluindo?: boolean;
}

const TAB_TRIGGER_CLASS = cn(
  "group rounded-full px-3 py-1.5 text-sm font-medium flex-1 gap-1.5",
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
  onClonar,
  onExcluir,
  isClonando = false,
  isExcluindo = false,
}: CasoEditHeaderProps) {
  const router = useRouter();

  const tabs: TabItem[] = [
    { value: "inicial", label: "Inicial" },
    { value: "anotacoes", label: "Anotações", count: countAnotacoes },
    { value: "relacoes", label: "Relações", count: countRelacoes },
    { value: "clientes", label: "Clientes", count: countClientes },
    { value: "producao", label: "Produção" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 shrink-0 ">
      {/* Coluna esquerda: mesmo espaço do conteúdo à esquerda do formulário */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <TabsList className="w-full flex sm:w-auto h-full items-center rounded-full bg-white py-1 text-muted-foreground gap-0">
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
        <Button
          type="button"
          variant="outline"
          className=" px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 flex-1"
          onClick={onExcluir}
          disabled={isExcluindo}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
