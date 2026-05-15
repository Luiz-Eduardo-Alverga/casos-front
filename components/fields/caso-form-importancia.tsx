"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import {
  auxiliarImportanciasParaCombobox,
  type AuxiliarImportanciaTipoFilter,
  useImportancias,
} from "@/hooks/catalogos/use-importancias";

interface CasoFormImportanciaProps {
  /**
   * Filtro enviado à API como `tipo` (`CASO` | `REPORT`).
   * REPORT: labels com `descricao`. CASO: labels com `TipoPrioridade`
   * (fallback em `descricao` / Registro se `TipoPrioridade` vier vazio).
   */
  tipo?: AuxiliarImportanciaTipoFilter;
  required?: boolean;
  disabled?: boolean;
  excludeLabels?: string[];
}

export function CasoFormImportancia({
  tipo = "REPORT",
  required = true,
  disabled,
  excludeLabels,
}: CasoFormImportanciaProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { setValue, watch } = useFormContext();
  const importanciaValue = watch("importancia");

  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const { data: importancias, isLoading, isError } = useImportancias({
    tipo,
    enabled: optionsRequested,
  });

  const excludeSet = useMemo(() => {
    const list = (excludeLabels ?? [])
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
    return new Set(list.map(normalizeLabel));
  }, [excludeLabels]);

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

    if (excludeSet.size === 0) return list;
    return list.filter((o) => !excludeSet.has(normalizeLabel(o.label)));
  }, [
    importancias,
    tipo,
    lazyLoadComboboxOptions,
    editCaseItem,
    importanciaValue,
    excludeSet,
  ]);

  useEffect(() => {
    if (excludeSet.size === 0) return;
    const valor =
      importanciaValue != null ? String(importanciaValue).trim() : "";
    if (!valor) return;
    const isAllowed = options.some((o) => o.value === valor);
    if (isAllowed) return;
    setValue("importancia", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [excludeSet, importanciaValue, options, setValue]);

  const placeholder =
    isLoading ? "Carregando importâncias…" : "Selecione a importância…";

  let emptyText = "Nenhuma importância encontrada.";
  if (isLoading) emptyText = "Carregando importâncias...";
  if (isError) emptyText = "Não foi possível carregar as importâncias.";

  const disabledFinal = isDisabled || Boolean(disabled);

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
        disabled={disabledFinal}
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

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
