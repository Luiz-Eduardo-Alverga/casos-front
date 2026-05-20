"use client";

import { FolderKanban } from "lucide-react";
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
import { TIPO_PROJETO_OPTIONS } from "@/components/projetos/cadastro/constants";

interface CasoFormProjetoTipoProps {
  required?: boolean;
}

export function CasoFormProjetoTipo({ required = false }: CasoFormProjetoTipoProps) {
  const { isDisabled } = useCasoForm();
  const { control, formState } = useFormContext();
  const error = formState.errors.tipo?.message as string | undefined;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-text-label">
          Tipo do Projeto {required && <span className="text-text-error">*</span>}
        </Label>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Controller
        name="tipo"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-9 rounded-lg border-border-input">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Selecione o tipo..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {TIPO_PROJETO_OPTIONS.map((opt) => (
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
