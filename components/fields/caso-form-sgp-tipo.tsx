"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Tag } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useSgpTipos } from "@/hooks/catalogos/use-sgp-tipos";
import type { SgpTipo } from "@/services/auxiliar/sgp-tipos";

export type SgpTipoComboboxOption = { value: string; label: string };

export interface CasoFormSgpTipoProps {
  /** Nome do campo no react-hook-form (ex.: `idTipo`, `idPapel`). */
  name: string;
  label: string;
  icon?: LucideIcon;
  /** Filtra por `Tipo` no GET /auxiliar/sgp-tipos. */
  tipo?: string;
  placeholder?: string;
  emptyText?: string;
  required?: boolean;
  /** Quando false, não dispara a query (ex.: modal fechado). */
  queryEnabled?: boolean;
  /** Transforma a lista da API em opções do combobox. */
  mapOptions?: (tipos: SgpTipo[]) => SgpTipoComboboxOption[];
  /** Opção injetada na edição quando o valor atual não está na lista. */
  fallbackOption?: SgpTipoComboboxOption | null;
}

function defaultMapOptions(tipos: SgpTipo[]): SgpTipoComboboxOption[] {
  return tipos.map((t) => ({
    value: String(t.Registro),
    label: t.Nomes?.trim() || `Tipo ${t.Registro}`,
  }));
}

export function CasoFormSgpTipo({
  name,
  label,
  icon = Tag,
  tipo,
  placeholder = "Selecione...",
  emptyText = "Nenhum item encontrado.",
  required = false,
  queryEnabled = true,
  mapOptions = defaultMapOptions,
  fallbackOption = null,
}: CasoFormSgpTipoProps) {
  const { isDisabled, lazyLoadComboboxOptions } = useCasoForm();
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const tipoFilter = tipo?.trim() || undefined;
  const shouldFetch = queryEnabled && optionsRequested;

  const { data: tiposResponse, isLoading } = useSgpTipos({
    tipo: tipoFilter,
    enabled: shouldFetch,
  });

  const tiposData = tiposResponse?.data;
  const tipos = useMemo(() => tiposData ?? [], [tiposData]);

  const options = useMemo(() => {
    const base = mapOptions(tipos);
    if (
      fallbackOption?.value &&
      !base.some((o) => o.value === fallbackOption.value)
    ) {
      return [fallbackOption, ...base];
    }
    return base;
  }, [tipos, mapOptions, fallbackOption]);

  const resolvedEmptyText = isLoading ? "Carregando..." : emptyText;

  return (
    <ComboboxField
      name={name}
      label={label}
      icon={icon}
      options={options}
      placeholder={placeholder}
      emptyText={resolvedEmptyText}
      searchDebounceMs={450}
      disabled={isDisabled}
      required={required}
      onOpenChange={
        lazyLoadComboboxOptions
          ? (open) => open && setOptionsRequested(true)
          : undefined
      }
    />
  );
}
