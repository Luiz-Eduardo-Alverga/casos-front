"use client";

import { useState, useMemo } from "react";
import { Activity } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useOrigens } from "@/hooks/use-origens";

export function CasoFormOrigem() {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const origemValue = watch("origem");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);

  const { data: origens, isLoading: isOrigensLoading } = useOrigens({
    enabled: optionsRequested,
  });

  const origensOptions = useMemo(() => {
    const list = (origens ?? []).map((origem) => ({
      value: origem.id,
      label: origem.nome,
    }));
    if (lazyLoadComboboxOptions && editCaseItem?.caso?.caracteristicas && origemValue && !list.some((o) => o.value === origemValue)) {
      const c = editCaseItem.caso.caracteristicas;
      list.unshift({ value: String(c.id_origem), label: c.tipo_origem ?? String(c.id_origem) });
    }
    return list;
  }, [origens, lazyLoadComboboxOptions, editCaseItem, origemValue]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="origem"
        label="Origem"
        icon={Activity}
        options={origensOptions}
        placeholder="Selecione a origem..."
        emptyText={isOrigensLoading ? "Carregando origens..." : "Nenhuma origem encontrada."}
        // onSearchChange={setOrigensSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
