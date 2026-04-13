"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";
import { listDevicesClient } from "@/services/db-api/list-cadastros";
import { DeviceMultiSelect } from "@/components/fields/device-multi-select";
import type { StatusAdquirentesFormValues } from "../sheet/status-adquirentes-sheet";

interface AcquirerStatusDevicesFieldProps {
  disabled?: boolean;
}

export function AcquirerStatusDevicesField({
  disabled = false,
}: AcquirerStatusDevicesFieldProps) {
  const { control, watch } = useFormContext<StatusAdquirentesFormValues>();
  const selectedIds = watch("supportedDeviceIds");

  const { data, isLoading } = useQuery({
    queryKey: ["db-devices", "sheet-options"],
    queryFn: () => listDevicesClient(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const options = useMemo(() => {
    const list =
      data?.map((item) => ({
        value: item.id,
        label: item.name,
      })) ?? [];

    for (const selectedId of selectedIds ?? []) {
      if (!list.some((option) => option.value === selectedId)) {
        list.unshift({ value: selectedId, label: selectedId.slice(0, 8) });
      }
    }

    return list;
  }, [data, selectedIds]);

  return (
    <Controller
      name="supportedDeviceIds"
      control={control}
      render={({ field }) => (
        <DeviceMultiSelect
          id="status-adquirentes-supported-devices"
          value={Array.isArray(field.value) ? field.value : []}
          onChange={field.onChange}
          options={options}
          disabled={disabled}
          emptyText={
            isLoading
              ? "Carregando dispositivos..."
              : "Nenhum dispositivo encontrado."
          }
        />
      )}
    />
  );
}
