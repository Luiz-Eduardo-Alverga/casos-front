"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTamanhos } from "@/hooks/use-tamanhos";
import { cn } from "@/lib/utils";
import type { TamanhoItem } from "@/services/auxiliar/tamanhos";

/**
 * Formata o tempo retornado pela API (ex.: "1899-12-30 00:15:00.000") para exibição em horas/minutos.
 * - Menos de 1 hora: "15 min"
 * - 1 hora exata: "1 hora"
 * - 2+ horas exatas: "2 horas"
 * - Horas e minutos: "2 h 30 min"
 */
export function formatTempoTamanho(tempo: string | null | undefined): string {
  if (!tempo?.trim()) return "";
  const match = tempo.trim().match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})/);
  if (!match) return tempo;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours === 0 && minutes === 0) return "0 min";
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return hours === 1 ? "1 hora" : `${hours} horas`;
  return `${hours} h ${minutes} min`;
}

/**
 * Converte o tempo da API (ex.: "1899-12-30 00:15:00.000") para HH:mm (ex.: "00:15").
 */
export function tempoApiToHHMM(tempo: string | null | undefined): string {
  if (!tempo?.trim()) return "";
  const match = tempo.trim().match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const h = match[1].padStart(2, "0");
  const m = match[2].padStart(2, "0");
  return `${h}:${m}`;
}

export interface TamanhoComboboxProps {
  value: string;
  onValueChange: (value: string | undefined) => void;
  /** Chamado quando um tamanho é selecionado, com o tempo em HH:mm para preencher o campo tempo estimado */
  onTamanhoSelect?: (id: string, tempoHHMM: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
}

export function TamanhoCombobox({
  value,
  onValueChange,
  onTamanhoSelect,
  disabled = false,
  placeholder = "Selecione o tamanho...",
  label = "Tamanho",
  id = "tamanho",
}: TamanhoComboboxProps) {
  const { data: tamanhosData, isLoading } = useTamanhos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tamanhos = tamanhosData ?? [];

  const options = useMemo(
    () =>
      tamanhos.map((t: TamanhoItem) => {
        const tempoFormatado = formatTempoTamanho(t.tempo);
        const labelText = `${t.tamanho} | ${tempoFormatado} | ${t.descricao ?? ""}`.trim();
        return { value: t.id, label: labelText };
      }),
    [tamanhos]
  );

  const handleValueChange = (newValue: string | undefined) => {
    onValueChange(newValue);
    if (onTamanhoSelect && newValue) {
      const selected = tamanhos.find((t: TamanhoItem) => t.id === newValue);
      if (selected) {
        onTamanhoSelect(newValue, tempoApiToHHMM(selected.tempo));
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-text-label">
        {label}
      </Label>
      <div className="group flex items-center">
        <div
          className={cn(
            "flex-1 min-w-0 [&_button]:border-border-input [&_button]:rounded-lg [&_button]:h-[42px] [&_button]:px-[17px] [&_button]:py-3",
            value &&
              "[&_button]:rounded-l-lg [&_button]:rounded-r-none [&_button]:border-r-0",
            !value && "[&_button]:rounded-lg",
          )}
        >
          <Combobox
            options={options}
            value={value || undefined}
            onValueChange={handleValueChange}
            placeholder={isLoading ? "Carregando..." : placeholder}
            emptyText="Nenhum tamanho encontrado."
            disabled={disabled || isLoading}
            className="text-left"
          />
        </div>
        {value && (
          <Button
            tabIndex={-1}
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "h-[42px] w-[42px] shrink-0 rounded-l-none border-l-0 -ml-px rounded-r-lg border-border-input",
              "group-hover:bg-accent group-hover:text-accent-foreground",
              "group-focus-within:ring-1 group-focus-within:ring-ring",
            )}
            onClick={() => onValueChange(undefined)}
            disabled={disabled}
            aria-label="Remover seleção"
          >
            <X className="h-4 w-4 opacity-50" />
          </Button>
        )}
      </div>
    </div>
  );
}
