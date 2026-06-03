"use client";

import { ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CreateFormHeaderActionsProps {
  onBack: () => void;
  onLimparFormulario: () => void;
  onOpenAssistant?: () => void;
  assistantDisabled?: boolean;
}

export function CreateFormHeaderActions({
  onBack,
  onLimparFormulario,
  onOpenAssistant,
  assistantDisabled = false,
}: CreateFormHeaderActionsProps) {
  return (
    <>
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

      {onOpenAssistant ? (
        <Button
          type="button"
          onClick={onOpenAssistant}
          className="w-full sm:w-auto flex-1 bg-gradient-to-r from-gradient-start to-gradient-end px-4 text-white hover:opacity-90 sm:flex-initial"
          disabled={assistantDisabled}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Assistente IA
        </Button>
      ) : null}
    </>
  );
}

export interface CreateFormHeaderProps extends CreateFormHeaderActionsProps {
  title: string;
  description: string;
}

/** @deprecated Prefira ListagemPageLayout + CreateFormHeaderActions */
export function CreateFormHeader({
  title,
  description,
  ...actionProps
}: CreateFormHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
        <CreateFormHeaderActions {...actionProps} />
      </div>
    </div>
  );
}
