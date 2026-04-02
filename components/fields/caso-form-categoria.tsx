"use client";

import { useState, useMemo } from "react";
import { Tag } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useCategorias } from "@/hooks/use-categorias";

interface CasoFormCategoriaProps {
  required?: boolean;
}

export function CasoFormCategoria({ required = true }: CasoFormCategoriaProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const categoriaValue = watch("categoria");
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const { data: categorias, isLoading: isCategoriasLoading } = useCategorias({
    enabled: optionsRequested,
  });

  const categoriasOptions = useMemo(() => {
    const list = (categorias ?? []).map((categoria) => ({
      value: categoria.id,
      label: categoria.tipo_categoria,
    }));
    if (
      lazyLoadComboboxOptions &&
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
  }, [categorias, lazyLoadComboboxOptions, editCaseItem, categoriaValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="categoria"
        label="Categoria"
        icon={Tag}
        options={categoriasOptions}
        placeholder="Selecione a categoria..."
        emptyText={
          isCategoriasLoading
            ? "Carregando categorias..."
            : "Nenhuma categoria encontrada."
        }
        // onSearchChange={setCategoriasSearch}
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
