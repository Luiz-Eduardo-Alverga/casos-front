"use client";

import { Package } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { STATUS_PROJETO_OPTIONS } from "@/components/projetos/cadastro/constants";

interface CasoFormProjetoStatusProps {
  required?: boolean;
}

export function CasoFormProjetoStatus({
  required = false,
}: CasoFormProjetoStatusProps) {
  const { isDisabled } = useCasoForm();
  const { control, formState } = useFormContext();
  const error = formState.errors.status?.message as string | undefined;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-text-label">
          Status do Projeto {required && <span className="text-text-error">*</span>}
        </Label>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-9 rounded-lg border-border-input">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Selecione o status..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_PROJETO_OPTIONS.map((opt) => (
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
