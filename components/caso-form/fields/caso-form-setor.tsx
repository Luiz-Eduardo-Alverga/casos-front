"use client";

import { useState, useMemo } from "react";
import { Building2 } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useSetores } from "@/hooks/use-setores";

interface CasoFormSetorProps {
  required?: boolean;
}

export function CasoFormSetor({ required = false }: CasoFormSetorProps) {
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
    <div className="space-y-2">
      <ComboboxField
        name="setor"
        label="Setor"
        icon={Building2}
        options={setoresOptions}
        placeholder="Selecione o setor..."
        emptyText={
          isSetoresLoading
            ? "Carregando setores..."
            : "Nenhum setor encontrado."
        }
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined
        }
      />
    </div>
  );
}
