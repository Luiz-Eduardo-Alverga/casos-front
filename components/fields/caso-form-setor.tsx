"use client";

import { useState, useMemo } from "react";
import { Building2 } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useSetores } from "@/hooks/catalogos/use-setores";

interface CasoFormSetorProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  hideLabel?: boolean;
  valueLabelPrefix?: string;
  wrapperClassName?: string;
  selectedLabelOverride?: string;
}

export function CasoFormSetor({
  name = "setor",
  label = "Setor",
  placeholder = "Selecione o setor...",
  required = false,
  hideLabel = false,
  valueLabelPrefix,
  wrapperClassName,
  selectedLabelOverride,
}: CasoFormSetorProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const setorValue = watch(name);
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);

  const { data: setores, isLoading: isSetoresLoading } = useSetores({
    enabled: optionsRequested,
  });

  const setoresOptions = useMemo(() => {
    const list = (setores ?? []).map((setor) => ({
      value: String(setor.id),
      label: setor.nome,
    }));
    if (
      setorValue &&
      !list.some((o) => o.value === setorValue)
    ) {
      const fallbackLabel =
        selectedLabelOverride?.trim() ||
        (name === "setor" && lazyLoadComboboxOptions
          ? editCaseItem?.projeto?.setores?.setor_projeto ??
            editCaseItem?.projeto?.setores?.setor
          : undefined);
      if (fallbackLabel) {
        list.unshift({
          value: setorValue,
          label: fallbackLabel,
        });
      }
    }
    return list;
  }, [
    setores,
    lazyLoadComboboxOptions,
    editCaseItem,
    setorValue,
    name,
    selectedLabelOverride,
  ]);

  return (
    <div className={hideLabel ? undefined : "space-y-2"}>
      <ComboboxField
        name={name}
        label={label}
        icon={Building2}
        options={setoresOptions}
        placeholder={placeholder}
        emptyText="Nenhum setor encontrado."
        isLoading={optionsRequested && isSetoresLoading}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        hideLabel={hideLabel}
        valueLabelPrefix={valueLabelPrefix}
        wrapperClassName={wrapperClassName}
        onOpenChange={
          lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined
        }
      />
    </div>
  );
}
