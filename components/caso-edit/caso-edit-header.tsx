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

  return (
    <div className="flex flex-col lg:flex-row gap-6 shrink-0 ">
      {/* Coluna esquerda: mesmo espaço do conteúdo à esquerda do formulário */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <TabsList className=" w-full sm:w-auto inline-flex h-9 items-center justify-start rounded-lg bg-white p-1 text-muted-foreground gap-0 flex-wrap ">
          <TabsTrigger
            value="inicial"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium ",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
          >
            Inicial
          </TabsTrigger>
          <TabsTrigger
            value="anotacoes"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium ",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
          >
            Anotações ({countAnotacoes})
          </TabsTrigger>
          <TabsTrigger
            value="relacoes"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium ",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
          >
            Relações ({countRelacoes})
          </TabsTrigger>
          <TabsTrigger
            value="clientes"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium ",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
          >
            Clientes ({countClientes})
          </TabsTrigger>
          <TabsTrigger
            value="producao"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
          >
            Produção
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Coluna direita: mesmo espaço da coluna direita do formulário (362px em lg) */}
      <div className="w-full lg:w-[362px] flex flex-row items-center justify-between gap-2 shrink-0 ">
        <Button
          type="button"
          variant="outline"
          className=" px-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Voltar
        </Button>
        <Button
          type="button"
          variant="outline"
          className=" px-3"
          onClick={onClonar}
          disabled={isClonando}
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          {isClonando ? "Clonando..." : "Clonar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className=" px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
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
