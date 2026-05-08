"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import {
  auxiliarImportanciasParaCombobox,
  type AuxiliarImportanciaTipoFilter,
  useImportancias,
} from "@/hooks/use-importancias";

interface CasoFormImportanciaProps {
  /**
   * Filtro enviado à API como `tipo` (`CASO` | `REPORT`).
   * REPORT: labels com `descricao`. CASO: labels com `TipoPrioridade`
   * (fallback em `descricao` / Registro se `TipoPrioridade` vier vazio).
   */
  tipo?: AuxiliarImportanciaTipoFilter;
  required?: boolean;
}

export function CasoFormImportancia({
  tipo = "REPORT",
  required = true,
}: CasoFormImportanciaProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const importanciaValue = watch("importancia");

  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const { data: importancias, isLoading, isError } = useImportancias({
    tipo,
    enabled: optionsRequested,
  });

  const options = useMemo(() => {
    const list = auxiliarImportanciasParaCombobox(importancias ?? [], tipo);

    const prioridadeCaso = editCaseItem?.caso?.caracteristicas?.prioridade;
    const valor =
      importanciaValue != null ? String(importanciaValue).trim() : "";
    if (
      lazyLoadComboboxOptions &&
      valor &&
      !list.some((o) => o.value === valor) &&
      prioridadeCaso !== undefined &&
      prioridadeCaso !== null &&
      String(prioridadeCaso).trim() !== ""
    ) {
      list.unshift({
        value: valor,
        label: String(prioridadeCaso),
      });
    }

    return list;
  }, [
    importancias,
    tipo,
    lazyLoadComboboxOptions,
    editCaseItem,
    importanciaValue,
  ]);

  const placeholder =
    isLoading ? "Carregando importâncias…" : "Selecione a importância…";

  let emptyText = "Nenhuma importância encontrada.";
  if (isLoading) emptyText = "Carregando importâncias...";
  if (isError) emptyText = "Não foi possível carregar as importâncias.";

  return (
    <div className="space-y-2">
      <ComboboxField
        name="importancia"
        label="Importância"
        icon={AlertTriangle}
        options={options}
        placeholder={placeholder}
        emptyText={emptyText}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
