"use client";

import { useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export interface PainelPageHeaderProps {
  /** Quando true, desabilita os botões de ação (ex.: skeleton de carregamento). */
  isLoading?: boolean;
  onHorasAnaliticas?: () => void;
  actionSlot?: ReactNode;
}

export function PainelPageHeader({
  isLoading,
  onHorasAnaliticas,
  actionSlot,
}: PainelPageHeaderProps) {
  const queryClient = useQueryClient();
  const handleAtualizar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
  }, [queryClient]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Painel do Desenvolvedor
        </h1>
        <p className="text-sm text-text-secondary">
          Selecione um produto abaixo para filtrar os dados do Kanban
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto ">
        {actionSlot}
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={isLoading ? undefined : onHorasAnaliticas}
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Horas Analiticas
        </Button>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={isLoading ? undefined : handleAtualizar}
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>
    </div>
  );
}
