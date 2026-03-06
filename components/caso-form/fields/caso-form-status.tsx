"use client";

import { useMemo } from "react";
import { CircleDot } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useStatus } from "@/hooks/use-status";

export function CasoFormStatus() {
  const { isDisabled } = useCasoForm();

  const { data: statusList, isLoading: isStatusLoading } = useStatus();

  const statusOptions = useMemo(() => {
    if (!statusList || !Array.isArray(statusList)) return [];
    return statusList.map((item) => ({
      value: String(item.Registro),
      label: item.descricao ?? item.tipo ?? String(item.Registro),
    }));
  }, [statusList]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="status"
        label="Status"
        icon={CircleDot}
        options={statusOptions}
        placeholder="Selecione o status..."
        emptyText={
          isStatusLoading ? "Carregando status..." : "Nenhum status encontrado."
        }
        searchDebounceMs={450}
        disabled={isDisabled}
      />
    </div>
  );
}
