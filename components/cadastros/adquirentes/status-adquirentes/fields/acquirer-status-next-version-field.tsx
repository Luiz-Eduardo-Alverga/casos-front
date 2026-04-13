"use client";

import { useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { listVersionsClient } from "@/services/db-api/list-cadastros";
import type { StatusAdquirentesFormValues } from "../sheet/status-adquirentes-sheet";

interface AcquirerStatusNextVersionFieldProps {
  disabled?: boolean;
}

const NONE_OPTION = "__none__";

export function AcquirerStatusNextVersionField({
  disabled = false,
}: AcquirerStatusNextVersionFieldProps) {
  const { watch } = useFormContext<StatusAdquirentesFormValues>();
  const nextVersionId = watch("nextVersionId");

  const { data, isLoading } = useQuery({
    queryKey: ["db-versions", "sheet-options"],
    queryFn: () => listVersionsClient(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const options = useMemo(() => {
    const list = [
      { value: NONE_OPTION, label: "Não definir" },
      ...(data?.map((item) => ({
        value: item.id,
        label: item.name?.trim() ? item.name : item.id.slice(0, 8),
      })) ?? []),
    ];

    if (nextVersionId && !list.some((option) => option.value === nextVersionId)) {
      list.push({
        value: nextVersionId,
        label: nextVersionId.slice(0, 8),
      });
    }

    return list;
  }, [data, nextVersionId]);

  return (
    <ComboboxField
      name="nextVersionId"
      label="Próxima versão"
      icon={ArrowRightLeft}
      options={options}
      placeholder="Selecione a próxima versão..."
      emptyText={isLoading ? "Carregando versões..." : "Nenhuma versão encontrada."}
      searchDebounceMs={450}
      disabled={disabled}
    />
  );
}
