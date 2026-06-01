"use client";

import { useEffect, useMemo, useState } from "react";
import { Ruler } from "lucide-react";
import { useTamanhos } from "@/hooks/catalogos/use-tamanhos";
import type { TamanhoItem } from "@/services/auxiliar/tamanhos";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { ComboboxField } from "@/components/reports-form/combobox-field";

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
}: TamanhoComboboxProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const tamanhoIdEdicao = editCaseItem?.caso?.caracteristicas?.tamanho_id;

  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions || Boolean(value) || tamanhoIdEdicao != null,
  );

  const { data: tamanhosData, isLoading } = useTamanhos({
    enabled: optionsRequested,
  });
  const tamanhos = useMemo(() => tamanhosData ?? [], [tamanhosData]);

  const options = useMemo(
    () =>
      tamanhos.map((t: TamanhoItem) => {
        const tempoFormatado = formatTempoTamanho(t.tempo);
        const labelText =
          `${t.tamanho} | ${tempoFormatado} | ${t.descricao ?? ""}`.trim();
        return { value: t.id, label: labelText };
      }),
    [tamanhos],
  );

  const isFieldDisabled = disabled || isDisabled;

  useEffect(() => {
    if (!lazyLoadComboboxOptions) return;
    if (value || tamanhoIdEdicao != null) {
      setOptionsRequested(true);
    }
  }, [lazyLoadComboboxOptions, value, tamanhoIdEdicao]);

  return (
    <div className="space-y-2">
      <ComboboxField
        label={label}
        icon={Ruler}
        options={options}
        value={value ?? ""}
        onValueChange={(next) => {
          const nextValue = (next ?? "").trim();
          onValueChange(nextValue ? nextValue : undefined);
          if (onTamanhoSelect && nextValue) {
            const selected = tamanhos.find(
              (t: TamanhoItem) => t.id === nextValue,
            );
            if (selected) {
              onTamanhoSelect(nextValue, tempoApiToHHMM(selected.tempo));
            }
          }
        }}
        placeholder={isLoading ? "Carregando..." : placeholder}
        emptyText={isLoading ? "Carregando..." : "Nenhum tamanho encontrado."}
        searchDebounceMs={450}
        disabled={isFieldDisabled || isLoading}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
