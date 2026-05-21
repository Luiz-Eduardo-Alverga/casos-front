"use client";

import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useSgpObjetivos } from "@/hooks/catalogos/use-sgp-objetivos";

interface CasoFormSgpObjetivoProps {
  required?: boolean;
  /** Opção exibida quando o valor já está no form mas ainda não está na lista carregada. */
  fallbackOption?: { value: string; label: string };
}

export function CasoFormSgpObjetivo({
  required = false,
  fallbackOption,
}: CasoFormSgpObjetivoProps) {
  const { isDisabled, lazyLoadComboboxOptions } = useCasoForm();
  const { watch } = useFormContext();
  const objetivoValue = watch("objetivo");
  const [objetivoSearch, setObjetivoSearch] = useState("");
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const searchTrimmed = objetivoSearch.trim();
  const shouldFetch =
    optionsRequested ||
    searchTrimmed.length >= 2 ||
    Boolean(objetivoValue);

  const { data: objetivosResponse, isLoading } = useSgpObjetivos({
    search: searchTrimmed.length >= 2 ? searchTrimmed : undefined,
    enabled: shouldFetch,
  });

  const objetivosOptions = useMemo(() => {
    const list = (objetivosResponse?.data ?? []).map((item) => ({
      value: String(item.Registro),
      label: item.Objetivo,
    }));

    if (!fallbackOption?.label || !objetivoValue) return list;

    const valorAtual = String(objetivoValue);
    const jaNaLista = list.some(
      (o) => o.value === valorAtual || o.label === fallbackOption.label,
    );
    const valorCombinaFallback =
      valorAtual === fallbackOption.value ||
      valorAtual === fallbackOption.label;

    if (!jaNaLista && valorCombinaFallback) {
      list.unshift({
        value: valorAtual,
        label: fallbackOption.label,
      });
    }
    return list;
  }, [objetivosResponse?.data, fallbackOption, objetivoValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="objetivo"
        label="Objetivo"
        icon={Target}
        options={objetivosOptions}
        placeholder="Selecione o objetivo..."
        emptyText={
          isLoading
            ? "Carregando objetivos..."
            : searchTrimmed.length > 0 && searchTrimmed.length < 2
              ? "Digite pelo menos 2 caracteres para pesquisar."
              : "Nenhum objetivo encontrado."
        }
        onSearchChange={setObjetivoSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
