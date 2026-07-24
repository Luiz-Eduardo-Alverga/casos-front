"use client";

import { useState, useMemo } from "react";
import { Building2 } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useSetores } from "@/hooks/catalogos/use-setores";

interface CasoFormSetorProps {
  required?: boolean;
  hideLabel?: boolean;
  valueLabelPrefix?: string;
  wrapperClassName?: string;
}

export function CasoFormSetor({
  required = false,
  hideLabel = false,
  valueLabelPrefix,
  wrapperClassName,
}: CasoFormSetorProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const setorValue = watch("setor");
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
      lazyLoadComboboxOptions &&
      editCaseItem?.projeto?.setores &&
      setorValue &&
      !list.some((o) => o.value === setorValue)
    ) {
      const s = editCaseItem.projeto.setores;
      list.unshift({
        value: setorValue,
        label: s.setor_projeto ?? s.setor ?? setorValue,
      });
    }
    return list;
  }, [setores, lazyLoadComboboxOptions, editCaseItem, setorValue]);

  return (
    <div className={hideLabel ? undefined : "space-y-2"}>
      <ComboboxField
        name="setor"
        label="Setor"
        icon={Building2}
        options={setoresOptions}
        placeholder="Selecione o setor..."
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
