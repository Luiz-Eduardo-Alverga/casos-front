"use client";

import { useEffect, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useSgpRiscosCadastro } from "@/hooks/catalogos/use-sgp-riscos-cadastro";

export interface CasoFormSgpRiscoCadastroProps {
  /** Nome do campo no react-hook-form (ex.: `idRisco`). */
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Quando false, não dispara a query (ex.: modal fechado). */
  queryEnabled?: boolean;
  /** Opção exibida quando o valor já está no form mas ainda não está na lista carregada. */
  fallbackOption?: { value: string; label: string };
  /** Campo auxiliar para persistir o label selecionado (ex.: `idRiscoLabel`). */
  labelName?: string;
}

export function CasoFormSgpRiscoCadastro({
  name = "idRisco",
  label = "Risco",
  placeholder = "Selecione o risco...",
  required = false,
  queryEnabled = true,
  fallbackOption,
  labelName = "idRiscoLabel",
}: CasoFormSgpRiscoCadastroProps) {
  const { isDisabled, lazyLoadComboboxOptions } = useCasoForm();
  const { watch, getValues, setValue } = useFormContext();
  const riscoValue = watch(name);
  const [riscoSearch, setRiscoSearch] = useState("");
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const searchTrimmed = riscoSearch.trim();
  const shouldFetch =
    queryEnabled &&
    (optionsRequested ||
      searchTrimmed.length >= 2 ||
      Boolean(riscoValue));

  const { data: riscosResponse, isLoading } = useSgpRiscosCadastro({
    search: searchTrimmed.length >= 2 ? searchTrimmed : undefined,
    enabled: shouldFetch,
  });

  const riscosOptions = useMemo(() => {
    const list = (riscosResponse?.data ?? []).map((item) => ({
      value: String(item.id),
      label: item.nome_risco?.trim() || `Risco ${item.id}`,
    }));

    if (!fallbackOption?.label || !riscoValue) return list;

    const valorAtual = String(riscoValue);
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
  }, [riscosResponse?.data, fallbackOption, riscoValue]);

  useEffect(() => {
    const currentId = riscoValue?.toString().trim();
    if (!currentId) {
      const currentLabel = String(getValues(labelName as any) ?? "");
      if (currentLabel !== "") {
        setValue(labelName as any, "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
      return;
    }

    const option = riscosOptions.find((o) => o.value === currentId);
    if (!option?.label) return;

    const currentLabel = String(getValues(labelName as any) ?? "");
    if (currentLabel !== option.label) {
      setValue(labelName as any, option.label, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [riscoValue, riscosOptions, getValues, setValue, labelName]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label={label}
        icon={TriangleAlert}
        options={riscosOptions}
        placeholder={placeholder}
        emptyText={
          isLoading
            ? "Carregando riscos..."
            : searchTrimmed.length > 0 && searchTrimmed.length < 2
              ? "Digite pelo menos 2 caracteres para pesquisar."
              : "Nenhum risco encontrado."
        }
        onSearchChange={setRiscoSearch}
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
