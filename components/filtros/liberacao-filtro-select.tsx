"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LIBERACAO_FILTRO_OPTIONS,
  type LiberacaoFiltro,
} from "@/components/filtros/liberacao-filtro";
import { cn } from "@/lib/utils";

export interface LiberacaoFiltroSelectProps {
  value: LiberacaoFiltro;
  onValueChange: (value: LiberacaoFiltro) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}

export function LiberacaoFiltroSelect({
  value,
  onValueChange,
  label = "Liberação",
  placeholder = "Liberação: Todos",
  disabled = false,
  className,
  hideLabel = false,
}: LiberacaoFiltroSelectProps) {
  return (
    <div className={cn(hideLabel ? "space-y-0" : "space-y-2", className)}>
      {!hideLabel ? (
        <Label className="text-sm font-medium text-text-label">{label}</Label>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as LiberacaoFiltro)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Filtrar por liberação"
          className="h-9 w-full rounded-lg border-border-input font-semibold"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {LIBERACAO_FILTRO_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
