"use client";

import { CircleDot } from "lucide-react";
import { useMemo } from "react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { STATUS_TYPE_VALUES } from "@/lib/validators/db/shared";

interface AcquirerStatusStatusFieldProps {
  disabled?: boolean;
}

export function AcquirerStatusStatusField({
  disabled = false,
}: AcquirerStatusStatusFieldProps) {
  const options = useMemo(
    () =>
      STATUS_TYPE_VALUES.map((status) => ({
        value: status,
        label: status,
      })),
    [],
  );

  return (
    <ComboboxField
      name="status"
      label="Status"
      icon={CircleDot}
      options={options}
      placeholder="Selecione o status..."
      emptyText="Nenhum status encontrado."
      searchDebounceMs={450}
      disabled={disabled}
      required
    />
  );
}
