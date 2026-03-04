"use client";

import { useState, useMemo } from "react";
import { Activity } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useOrigens } from "@/hooks/use-origens";

export function CasoFormOrigem() {
  const { isDisabled } = useCasoForm();
  // const [origensSearch, setOrigensSearch] = useState<string>("");
  
  const { data: origens, isLoading: isOrigensLoading } = useOrigens();
  
  const origensOptions = useMemo(() => {
    if (!origens || !Array.isArray(origens)) return [];
    return origens.map((origem) => ({
      value: origem.id,
      label: origem.nome,
    }));
  }, [origens]);
  
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
      />
    </div>
  );
}
