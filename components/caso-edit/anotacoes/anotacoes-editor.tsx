"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLACEHOLDER_DESCRICAO_COMPLETA } from "./utils";
import { Loader2, Sparkles } from "lucide-react";

export interface AnotacoesEditorProps {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void | Promise<void>;
  onImproveWithIA: () => void | Promise<void>;
  disabled: boolean;
  isImproving?: boolean;
}

export function AnotacoesEditor({
  value,
  onChange,
  onSave,
  onImproveWithIA,
  disabled,
  isImproving = false,
}: AnotacoesEditorProps) {
  const improveDisabled = disabled || isImproving || !value.trim();

  return (
    <div className="shrink-0 flex flex-col items-end gap-3 border-b border-border-divider pb-4 space-y-2">
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor="nova-anotacao"
            className="text-sm font-medium text-text-label"
          >
            Descrição Completa
          </Label>

          <Button
            type="button"
            size="sm"
            onClick={onImproveWithIA}
            disabled={improveDisabled}
            className=" bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90 px-4 flex-1 sm:flex-initial"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Melhorando
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Melhorar com IA
              </>
            )}
          </Button>
        </div>

        <Textarea
          id="nova-anotacao"
          placeholder={PLACEHOLDER_DESCRICAO_COMPLETA}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[158px] w-full  rounded-lg border-border-input px-4 py-3"
          disabled={disabled}
        />
      </div>
      <Button
        type="button"
        onClick={onSave}
        disabled={!value.trim() || disabled}
        className="min-w-[86px]"
      >
        Salvar
      </Button>
    </div>
  );
}
