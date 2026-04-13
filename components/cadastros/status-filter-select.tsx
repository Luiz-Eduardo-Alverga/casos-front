"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { STATUS_TYPE_VALUES } from "@/lib/validators/db/shared";

const STATUS_SELECT_ALL = "__todos__";

const STATUS_SET = new Set<string>(STATUS_TYPE_VALUES);

interface StatusFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  triggerAriaLabel?: string;
  placeholder?: string;
}

export function StatusFilterSelect({
  value,
  onChange,
  label = "Status",
  triggerAriaLabel = "Filtrar por status",
  placeholder = "Todos os status",
}: StatusFilterSelectProps) {
  const trimmed = value.trim();
  /** Valor do Radix deve existir em um `SelectItem` (evita loop / estado inconsistente). */
  const radixValue =
    !trimmed ? STATUS_SELECT_ALL
    : STATUS_SET.has(trimmed) ? trimmed
    : STATUS_SELECT_ALL;

  const statusDesconhecidoNaUrl = Boolean(trimmed) && !STATUS_SET.has(trimmed);

  useEffect(() => {
    if (statusDesconhecidoNaUrl) {
      onChange("");
    }
  }, [statusDesconhecidoNaUrl, onChange]);

  return (
    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
      <Label className="text-sm font-medium text-text-label">{label}</Label>
      <Select
        value={radixValue}
        onValueChange={(next) => onChange(next === STATUS_SELECT_ALL ? "" : next)}
      >
        <SelectTrigger
          className="h-[42px] rounded-lg border-border-input"
          aria-label={triggerAriaLabel}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={STATUS_SELECT_ALL}>{placeholder}</SelectItem>
          {STATUS_TYPE_VALUES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
