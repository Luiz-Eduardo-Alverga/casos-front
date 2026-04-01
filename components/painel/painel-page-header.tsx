"use client";

import { Button } from "@/components/ui/button";
import { List, RefreshCcw } from "lucide-react";

export interface PainelPageHeaderProps {
  /** Quando true, desabilita os botões de ação (ex.: skeleton de carregamento). */
  isLoading?: boolean;
  onVerCasos?: () => void;
  onAtualizar?: () => void;
}

export function PainelPageHeader({
  isLoading = false,
  onVerCasos,
  onAtualizar,
}: PainelPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Painel do Desenvolvedor
        </h1>
        <p className="text-sm text-text-secondary">
          Gerencie os produtos priorizados e visualize seus casos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={isLoading ? undefined : onVerCasos}
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
        >
          <List className="h-3.5 w-3.5" />
          Ver Casos
        </Button>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={isLoading ? undefined : onAtualizar}
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
