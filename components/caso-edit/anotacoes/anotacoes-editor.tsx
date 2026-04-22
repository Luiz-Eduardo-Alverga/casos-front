"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLACEHOLDER_DESCRICAO_COMPLETA } from "./utils";

export interface AnotacoesEditorProps {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void | Promise<void>;
  disabled: boolean;
}

export function AnotacoesEditor({
  value,
  onChange,
  onSave,
  disabled,
}: AnotacoesEditorProps) {
  return (
    <div className="shrink-0 flex flex-col items-end gap-3 border-b border-border-divider pb-4 space-y-2">
      <div className="w-full space-y-2">
        <Label
          htmlFor="nova-anotacao"
          className="text-sm font-medium text-text-label"
        >
          Descrição Completa
        </Label>
        <Textarea
          id="nova-anotacao"
          placeholder={PLACEHOLDER_DESCRICAO_COMPLETA}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[158px] w-full resize-none rounded-lg border-border-input px-4 py-3"
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

