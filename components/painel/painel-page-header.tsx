"use client";

import { useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export interface PainelPageActionsProps {
  /** Quando true, desabilita os botões de ação (ex.: skeleton de carregamento). */
  isLoading?: boolean;
  /** Quando true, desabilita o botão Atualizar e gira o ícone (refetch em andamento). */
  isAtualizando?: boolean;
  onHorasAnaliticas?: () => void;
  actionSlot?: ReactNode;
}

export function PainelPageActions({
  isLoading,
  isAtualizando,
  onHorasAnaliticas,
  actionSlot,
}: PainelPageActionsProps) {
  const queryClient = useQueryClient();
  const handleAtualizar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
  }, [queryClient]);

  return (
    <>
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
        disabled={isLoading || isAtualizando}
        onClick={isLoading || isAtualizando ? undefined : handleAtualizar}
        type="button"
        className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
      >
        <RefreshCcw
          className={cn("h-3.5 w-3.5", isAtualizando && "animate-spin")}
          aria-hidden
        />
        Atualizar
      </Button>
    </>
  );
}
