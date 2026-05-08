"use client";

import { ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CreateFormHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
  onLimparFormulario: () => void;
  onOpenAssistant?: () => void;
  assistantDisabled?: boolean;
}

export function CreateFormHeader({
  title,
  description,
  onBack,
  onLimparFormulario,
  onOpenAssistant,
  assistantDisabled = false,
}: CreateFormHeaderProps) {
  return (
    <div className="mb-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full flex-1 px-4 sm:w-auto sm:flex-initial"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full flex-1 px-4 sm:w-auto sm:flex-initial"
          onClick={onLimparFormulario}
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Limpar formulário
        </Button>

        {onOpenAssistant ? (
          <Button
            type="button"
            onClick={onOpenAssistant}
            className="w-full flex-1 bg-gradient-to-r from-gradient-start to-gradient-end px-4 text-white hover:opacity-90 sm:w-auto sm:flex-initial"
            disabled={assistantDisabled}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Assistente IA
          </Button>
        ) : null}
      </div>
    </div>
  );
}
