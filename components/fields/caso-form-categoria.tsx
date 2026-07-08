"use client";

import { useEffect, useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import {
  resolveComboboxLazyLoad,
  useCasoForm,
} from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useCategorias } from "@/hooks/catalogos/use-categorias";

interface CasoFormCategoriaProps {
  name?: string;
  labelName?: string;
  required?: boolean;
  excludeTipoCategorias?: string[];
}

export function CasoFormCategoria({
  name = "categoria",
  labelName = "categoriaTipoLabel",
  required = true,
  excludeTipoCategorias = [],
}: CasoFormCategoriaProps) {
  const {
    isDisabled,
    lazyLoadComboboxOptions,
    eagerLoadComboboxFieldNames,
    editCaseItem,
  } = useCasoForm();
  const lazyLoad = resolveComboboxLazyLoad(
    { lazyLoadComboboxOptions, eagerLoadComboboxFieldNames },
    name,
  );
  const { getValues, setValue, watch } = useFormContext();
  const categoriaValue = watch(name);
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoad);

  const { data: categorias, isLoading: isCategoriasLoading } = useCategorias({
    enabled: optionsRequested,
  });

  const excludeSet = useMemo(
    () => new Set(excludeTipoCategorias.map((item) => item.toUpperCase())),
    [excludeTipoCategorias],
  );

  const categoriasOptions = useMemo(() => {
    const list = (categorias ?? [])
      .filter(
        (categoria) =>
          !excludeSet.has(String(categoria.tipo_categoria || "").toUpperCase()),
      )
      .map((categoria) => ({
        value: String(categoria.id),
        label: categoria.tipo_categoria,
      }));

    if (
      lazyLoad &&
      editCaseItem?.caso?.caracteristicas &&
      categoriaValue &&
      !list.some((o) => o.value === categoriaValue)
    ) {
      const c = editCaseItem.caso.caracteristicas;
      list.unshift({
        value: String(c.categoria),
        label: c.tipo_categoria ?? String(c.categoria),
      });
    }
    return list;
  }, [
    categorias,
    lazyLoad,
    editCaseItem,
    categoriaValue,
    excludeSet,
  ]);

  useEffect(() => {
    const selectedValue = String(categoriaValue ?? "").trim();
    if (!selectedValue) {
      const currentLabel = String(getValues(labelName as any) ?? "");
      if (currentLabel !== "") {
        setValue(labelName as any, "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
      return;
    }

    const option = categoriasOptions.find((item) => item.value === selectedValue);
    const nextLabel = option?.label ?? "";
    const currentLabel = String(getValues(labelName as any) ?? "");
    if (currentLabel !== nextLabel) {
      setValue(labelName as any, nextLabel, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [categoriaValue, categoriasOptions, getValues, labelName, setValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label="Categoria"
        icon={Tag}
        options={categoriasOptions}
        placeholder="Selecione a categoria..."
        emptyText="Nenhuma categoria encontrada."
        isLoading={optionsRequested && isCategoriasLoading}
        // onSearchChange={setCategoriasSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoad
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
