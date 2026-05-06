"use client";

import { ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReportsHeaderProps {
  onBack: () => void;
  onLimparFormulario: () => void;
  onOpenAssistant: () => void;
  assistantDisabled: boolean;
}

export function ReportsHeader({
  onBack,
  onLimparFormulario,
  onOpenAssistant,
  assistantDisabled,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Adicionar Novo Caso
        </h1>
        <p className="text-sm text-text-secondary">
          Preencha os campos abaixo para criar um novo caso
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={onLimparFormulario}
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Limpar formulário
        </Button>

        <Button
          type="button"
          onClick={onOpenAssistant}
          className="w-full sm:w-auto bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90 px-4 flex-1 sm:flex-initial"
          disabled={assistantDisabled}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Assistente IA
        </Button>
      </div>
    </div>
  );
}
