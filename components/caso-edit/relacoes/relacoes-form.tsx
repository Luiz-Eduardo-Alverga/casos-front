"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { TIPO_RELACAO_VALUES } from "./utils";
import type { RelacaoFormValues } from "./types";

export interface RelacoesFormProps {
  methods: UseFormReturn<RelacaoFormValues>;
  isSaving: boolean;
  disabled?: boolean;
  canSubmit: boolean;
  onSubmit: () => void | Promise<void>;
}

export function RelacoesForm({
  methods,
  isSaving,
  disabled = false,
  canSubmit,
  onSubmit,
}: RelacoesFormProps) {
  const isDisabled = disabled || isSaving;
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border-divider bg-muted/30">
      <div className="space-y-2 min-w-[220px]">
        <Label className="text-sm font-medium text-text-label">
          Tipo de relação
        </Label>
        <Select
          value={methods.watch("tipo_relacao")}
          onValueChange={(value) => methods.setValue("tipo_relacao", value)}
          disabled={isDisabled}
        >
          <SelectTrigger className="h-[42px] rounded-lg border-border-input min-w-[190px]">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {TIPO_RELACAO_VALUES.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 min-w-[150px]">
        <Label
          htmlFor="caso-relacionado"
          className="text-sm font-medium text-text-label"
        >
          Numero do caso
        </Label>
        <Input
          id="caso-relacionado"
          type="number"
          min={1}
          {...methods.register("caso_relacionado")}
          placeholder="Caso numero..."
          className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
          disabled={isDisabled}
        />
      </div>

      <div className="space-y-2 min-w-[240px] flex-1">
        <Label
          htmlFor="descricao-resumo-relacao"
          className="text-sm font-medium text-text-label"
        >
          Descricao resumida
        </Label>
        <Input
          id="descricao-resumo-relacao"
          {...methods.register("descricao_resumo")}
          placeholder="Descreva a relação..."
          className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
          disabled={isDisabled}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isDisabled}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}

