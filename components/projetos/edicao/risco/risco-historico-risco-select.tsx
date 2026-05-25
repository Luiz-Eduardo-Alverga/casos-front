"use client";

import { AlertTriangle } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import type { RiscoHistoricoFormValues } from "@/components/projetos/edicao/risco/risco-historico-form-schema";

export interface RiscoHistoricoRiscoSelectProps {
  riscos: SgpRiscoItem[];
  disabled?: boolean;
  required?: boolean;
}

export function RiscoHistoricoRiscoSelect({
  riscos,
  disabled = false,
  required = false,
}: RiscoHistoricoRiscoSelectProps) {
  const { control, formState } = useFormContext<RiscoHistoricoFormValues>();
  const error = formState.errors.idSeq?.message as string | undefined;

  const options = riscos.map((r) => ({
    value: String(r.sequencia),
    label: r.descricao_risco?.trim() || `Risco ${r.sequencia}`,
  }));

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-text-label">
          Risco {required && <span className="text-text-error">*</span>}
        </Label>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Controller
        name="idSeq"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 rounded-lg border-border-input">
              <div className="flex min-w-0 items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Selecione o risco..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
