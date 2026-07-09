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
  NAO_PLANEJADO_FILTRO_OPTIONS,
  type NaoPlanejadoFiltro,
} from "@/components/filtros/nao-planejado-filtro";
import { cn } from "@/lib/utils";

export interface NaoPlanejadoFiltroSelectProps {
  value: NaoPlanejadoFiltro;
  onValueChange: (value: NaoPlanejadoFiltro) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}

export function NaoPlanejadoFiltroSelect({
  value,
  onValueChange,
  label = "Planejamento",
  placeholder = "Planejamento: Todos",
  disabled = false,
  className,
  hideLabel = false,
}: NaoPlanejadoFiltroSelectProps) {
  return (
    <div className={cn(hideLabel ? "space-y-0" : "space-y-2", className)}>
      {!hideLabel ? (
        <Label className="text-sm font-medium text-text-label">{label}</Label>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as NaoPlanejadoFiltro)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Filtrar por planejamento"
          className="h-9 w-full rounded-lg border-border-input font-semibold"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {NAO_PLANEJADO_FILTRO_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
