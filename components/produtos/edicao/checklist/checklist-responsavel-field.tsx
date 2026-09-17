"use client";

import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import type { ComboboxOption } from "@/components/ui/combobox";

export interface ChecklistResponsavelFieldProps {
  name?: string;
  options: ComboboxOption[];
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ChecklistResponsavelField({
  name = "responsavelId",
  options,
  disabled,
  value,
  onValueChange,
}: ChecklistResponsavelFieldProps) {
  return (
    <ComboboxField
      name={onValueChange ? undefined : name}
      value={value}
      onValueChange={onValueChange}
      label={PRODUTO_LABELS.responsavel}
      icon={User}
      options={options}
      placeholder={PRODUTO_LABELS.colaboradorNenhum}
      emptyText="Nenhum usuário encontrado."
      hideLabel
      clearable
      disabled={disabled}
      wrapperClassName="w-56 shrink-0"
    />
  );
}
