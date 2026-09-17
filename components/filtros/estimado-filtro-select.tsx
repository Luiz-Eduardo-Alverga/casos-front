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
  ESTIMADO_FILTRO_OPTIONS,
  type EstimadoFiltro,
} from "@/components/filtros/estimado-filtro";
import { cn } from "@/lib/utils";

export interface EstimadoFiltroSelectProps {
  value: EstimadoFiltro;
  onValueChange: (value: EstimadoFiltro) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}

export function EstimadoFiltroSelect({
  value,
  onValueChange,
  label = "Estimado",
  placeholder = "Estimado: Todos",
  disabled = false,
  className,
  hideLabel = false,
}: EstimadoFiltroSelectProps) {
  return (
    <div className={cn(hideLabel ? "space-y-0" : "space-y-2", className)}>
      {!hideLabel ? (
        <Label className="text-sm font-medium text-text-label">{label}</Label>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as EstimadoFiltro)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Filtrar por estimado"
          className="h-9 w-full rounded-lg border-border-input font-semibold"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {ESTIMADO_FILTRO_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
