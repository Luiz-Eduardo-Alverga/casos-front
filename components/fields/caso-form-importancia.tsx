"use client";

import { AlertTriangle } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { importanceOptions } from "@/mocks/teste";

export function CasoFormImportancia() {
  const { isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="importancia"
        label="Importância"
        icon={AlertTriangle}
        options={importanceOptions}
        placeholder="Selecione a importância..."
        disabled={isDisabled}
        required
      />
    </div>
  );
}
