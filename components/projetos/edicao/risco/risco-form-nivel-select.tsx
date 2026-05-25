"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RISCO_NIVEL_OPTIONS } from "@/components/projetos/edicao/risco/risco-form-constants";
import type { RiscoFormValues } from "@/components/projetos/edicao/risco/risco-form-schema";

export interface RiscoFormNivelSelectProps {
  name: keyof Pick<RiscoFormValues, "probalidade" | "impacto">;
  label: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}

export function RiscoFormNivelSelect({
  name,
  label,
  placeholder,
  disabled = false,
  required = false,
}: RiscoFormNivelSelectProps) {
  const { control, formState } = useFormContext<RiscoFormValues>();
  const error = formState.errors[name]?.message;

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2">
        <Label className="text-sm font-medium text-text-label">
          {label}
          {required && <span className="text-text-error"> *</span>}
        </Label>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 rounded-lg border-border-input">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {RISCO_NIVEL_OPTIONS.map((opt) => (
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
