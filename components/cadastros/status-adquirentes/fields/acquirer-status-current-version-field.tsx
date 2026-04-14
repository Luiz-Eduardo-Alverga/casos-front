"use client";

import { useMemo } from "react";
import { GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { listVersionsClient } from "@/services/db-api/list-cadastros";
import type { StatusAdquirentesFormValues } from "../sheet/status-adquirentes-sheet";

interface AcquirerStatusCurrentVersionFieldProps {
  disabled?: boolean;
}

export function AcquirerStatusCurrentVersionField({
  disabled = false,
}: AcquirerStatusCurrentVersionFieldProps) {
  const { watch } = useFormContext<StatusAdquirentesFormValues>();
  const currentVersionId = watch("currentVersionId");

  const { data, isLoading } = useQuery({
    queryKey: ["db-versions", "sheet-options"],
    queryFn: () => listVersionsClient(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const options = useMemo(() => {
    const list =
      data?.map((item) => ({
        value: item.id,
        label: item.name?.trim() ? item.name : item.id.slice(0, 8),
      })) ?? [];

    if (
      currentVersionId &&
      !list.some((option) => option.value === currentVersionId)
    ) {
      list.unshift({
        value: currentVersionId,
        label: currentVersionId.slice(0, 8),
      });
    }
    return list;
  }, [currentVersionId, data]);

  return (
    <ComboboxField
      name="currentVersionId"
      label="Versão atual"
      icon={GitBranch}
      options={options}
      placeholder="Selecione a versão atual..."
      emptyText={isLoading ? "Carregando versões..." : "Nenhuma versão encontrada."}
      searchDebounceMs={450}
      disabled={disabled}
      required
    />
  );
}
