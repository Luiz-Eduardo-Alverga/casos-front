"use client";

import { useState, useMemo } from "react";
import { Tag } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useCategorias } from "@/hooks/use-categorias";

export function CasoFormCategoria() {
  const { isDisabled } = useCasoForm();
  // const [categoriasSearch, setCategoriasSearch] = useState<string>("");
  
  const { data: categorias, isLoading: isCategoriasLoading } = useCategorias();
  
  const categoriasOptions = useMemo(() => {
    if (!categorias || !Array.isArray(categorias)) return [];
    return categorias.map((categoria) => ({
      value: categoria.id,
      label: categoria.tipo_categoria,
    }));
  }, [categorias]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="categoria"
        label="Categoria"
        icon={Tag}
        options={categoriasOptions}
        placeholder="Selecione a categoria..."
        emptyText={isCategoriasLoading ? "Carregando categorias..." : "Nenhuma categoria encontrada."}
        // onSearchChange={setCategoriasSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
      />
    </div>
  );
}
