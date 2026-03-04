"use client";

import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useModulos } from "@/hooks/use-modulos";

export function CasoFormModulo() {
  const { produto, isDisabled } = useCasoForm();
  const { watch } = useFormContext();
  const produtoValue = watch("produto");
  // const [modulosSearch, setModulosSearch] = useState<string>("");
  
  const produtoAtual = produtoValue || produto;
  
  const { data: modulos, isLoading: isModulosLoading } = useModulos({
    produto_id: produtoAtual,
    // search: modulosSearch.trim() || undefined,
  });
  
  const modulosOptions = useMemo(() => {
    if (!modulos || !Array.isArray(modulos)) return [];
    // Retorna array de strings, então mapeamos para o formato do Combobox
    return modulos.map((modulo) => ({
      value: modulo,
      label: modulo,
    }));
  }, [modulos]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="modulo"
        label="Módulo"
        icon={Package}
        options={modulosOptions}
        placeholder={produtoAtual ? "Selecione o módulo..." : "Selecione o produto primeiro."}
        emptyText={isModulosLoading ? "Carregando módulos..." : "Nenhum módulo encontrado."}
        // onSearchChange={setModulosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual}
        required
      />
    </div>
  );
}
