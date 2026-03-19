"use client";

import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useModulos } from "@/hooks/use-modulos";

interface CasoFormModuloProps {
  required?: boolean;
}

export function CasoFormModulo({ required = true }: CasoFormModuloProps) {
  const { produto, isDisabled, lazyLoadComboboxOptions } = useCasoForm();
  const { watch } = useFormContext();
  const produtoValue = watch("produto");
  const moduloValue = watch("modulo");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);

  const produtoAtual = produtoValue || produto;

  const { data: modulos, isLoading: isModulosLoading } = useModulos({
    produto_id: produtoAtual,
    enabled: optionsRequested,
  });

  const modulosOptions = useMemo(() => {
    if (!modulos || !Array.isArray(modulos)) {
      if (moduloValue && typeof moduloValue === "string" && moduloValue.trim()) {
        return [{ value: moduloValue.trim(), label: moduloValue.trim() }];
      }
      return [];
    }
    const options = modulos.map((modulo) => ({
      value: modulo,
      label: modulo,
    }));
    if (moduloValue && typeof moduloValue === "string" && moduloValue.trim()) {
      const jaExiste = options.some((o) => o.value === moduloValue.trim());
      if (!jaExiste) options.unshift({ value: moduloValue.trim(), label: moduloValue.trim() });
    }
    return options;
  }, [modulos, moduloValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="modulo"
        label="Módulo"
        icon={Package}
        options={modulosOptions}
        placeholder={
          produtoAtual
            ? "Selecione o módulo..."
            : "Selecione o produto primeiro."
        }
        emptyText={
          isModulosLoading
            ? "Carregando módulos..."
            : "Nenhum módulo encontrado."
        }
        // onSearchChange={setModulosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual}
        required={required}
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
