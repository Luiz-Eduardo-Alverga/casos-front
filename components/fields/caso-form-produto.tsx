"use client";

import { useState, useEffect, useMemo } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useProdutos } from "@/hooks/use-produtos";
import type { Produto } from "@/services/auxiliar/produtos";

interface CasoFormProdutoProps {
  required?: boolean;
}

export function CasoFormProduto({ required = true }: CasoFormProdutoProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch, setValue } = useFormContext();
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  const { data: produtos, isLoading: isProdutosLoading } = useProdutos({
    enabled: optionsRequested,
  });

  const produtosOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    if (produtos && Array.isArray(produtos)) {
      produtos.forEach((p) => {
        options.push({
          value: String(p.id),
          label: p.nome_projeto,
        });
      });
    }

    if (produtoValue && produtoSelecionado) {
      const produtoValueStr = String(produtoSelecionado.id);
      const produtoLabel = `${produtoSelecionado.nome_projeto} - ${produtoSelecionado.setor}`;
      if (!options.some((opt) => opt.value === produtoValueStr)) {
        options.unshift({ value: produtoValueStr, label: produtoLabel });
      }
    }

    if (lazyLoadComboboxOptions && editCaseItem?.produto && produtoValue && !options.some((o) => o.value === produtoValue)) {
      const p = editCaseItem.produto;
      options.unshift({ value: String(p.id), label: p.nome });
    }

    return options;
  }, [produtos, produtoValue, produtoSelecionado, lazyLoadComboboxOptions, editCaseItem]);

  // Quando o produto é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (produtoValue && produtos && Array.isArray(produtos)) {
      const produtoEncontrado = produtos.find(
        (p) => String(p.id) === produtoValue,
      );
      if (produtoEncontrado) {
        setProdutoSelecionado(produtoEncontrado);
      }
    } else if (!produtoValue) {
      setProdutoSelecionado(null);
      // Limpar campos dependentes quando produto é removido
      setValue("versao", "");
      setValue("projeto", "");
      setValue("modulo", "");
    }
  }, [produtoValue, produtos, setValue]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="produto"
        label="Produto"
        icon={BriefcaseBusiness}
        options={produtosOptions}
        placeholder="Selecione o produto..."
        emptyText={
          isProdutosLoading
            ? "Carregando produtos..."
            : "Nenhum produto encontrado."
        }
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
