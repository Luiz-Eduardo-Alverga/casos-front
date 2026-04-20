"use client";

import { useState, useMemo } from "react";
import { CircleDot } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useStatus } from "@/hooks/use-status";

export function CasoFormStatus({ disabled = false }: { disabled?: boolean }) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const statusValue = watch("status");
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const { data: statusList, isLoading: isStatusLoading } = useStatus({
    enabled: optionsRequested,
  });

  const statusOptions = useMemo(() => {
    const list = (statusList ?? [])
      .filter((item) => item.tipo_status === "CASO")
      .map((item) => ({
      value: String(item.Registro),
      label: item.descricao ?? item.tipo ?? String(item.Registro),
      }));
    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.caso?.status &&
      statusValue &&
      !list.some((o) => o.value === statusValue)
    ) {
      const s = editCaseItem.caso.status;
      list.unshift({
        value: String(s.status_id),
        label: s.descricao ?? s.codigo ?? String(s.status_id),
      });
    }
    return list;
  }, [statusList, lazyLoadComboboxOptions, editCaseItem, statusValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="status"
        label="Status do caso"
        icon={CircleDot}
        options={statusOptions}
        placeholder="Selecione o status..."
        emptyText={
          isStatusLoading ? "Carregando status..." : "Nenhum status encontrado."
        }
        searchDebounceMs={450}
        disabled={isDisabled || disabled}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
