"use client";

import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { listAcquirersClient } from "@/services/db-api/list-cadastros";
import type { StatusAdquirentesFormValues } from "../sheet/status-adquirentes-sheet";

interface AcquirerStatusAcquirerFieldProps {
  disabled?: boolean;
}

export function AcquirerStatusAcquirerField({
  disabled = false,
}: AcquirerStatusAcquirerFieldProps) {
  const { watch } = useFormContext<StatusAdquirentesFormValues>();
  const acquirerId = watch("acquirerId");

  const { data, isLoading } = useQuery({
    queryKey: ["db-acquirers", "sheet-options"],
    queryFn: () => listAcquirersClient(undefined, { expand: "status" }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const options = useMemo(() => {
    const list =
      data?.map((item) => ({
        value: item.acquirer.id,
        label: item.acquirer.name,
      })) ?? [];

    if (acquirerId && !list.some((option) => option.value === acquirerId)) {
      list.unshift({ value: acquirerId, label: acquirerId });
    }

    return list;
  }, [acquirerId, data]);

  return (
    <ComboboxField
      name="acquirerId"
      label="Rede"
      icon={Building2}
      options={options}
      placeholder="Selecione a adquirente..."
      emptyText={isLoading ? "Carregando adquirentes..." : "Nenhuma adquirente encontrada."}
      searchDebounceMs={450}
      disabled={disabled}
      required
    />
  );
}
