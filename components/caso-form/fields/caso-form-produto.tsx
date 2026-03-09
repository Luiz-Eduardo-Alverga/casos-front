"use client";

import { useState, useEffect, useMemo } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useProdutos } from "@/hooks/use-produtos";
import type { Produto } from "@/services/auxiliar/produtos";

interface CasoFormProdutoProps {
  required?: boolean;
}

export function CasoFormProduto({ required = true }: CasoFormProdutoProps) {
  const { isDisabled } = useCasoForm();
  const { watch, setValue } = useFormContext();
  const produtoValue = watch("produto");
  // const [produtosSearch, setProdutosSearch] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  const { data: produtos, isLoading: isProdutosLoading } =
    useProdutos();
    // {search: produtosSearch.trim() || undefined,}

  const produtosOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    // Adiciona produtos da API
    if (produtos && Array.isArray(produtos)) {
      produtos.forEach((p) => {
        options.push({
          value: String(p.id),
          label: `${p.nome_projeto} - ${p.setor}`,
        });
      });
    }

    // Se há um produto selecionado e ele não está nas opções, adiciona ele no início
    if (produtoValue && produtoSelecionado) {
      const produtoValueStr = String(produtoSelecionado.id);
      const produtoLabel = `${produtoSelecionado.nome_projeto} - ${produtoSelecionado.setor}`;

      // Verifica se já não está nas opções
      const jaExiste = options.some((opt) => opt.value === produtoValueStr);
      if (!jaExiste) {
        options.unshift({
          value: produtoValueStr,
          label: produtoLabel,
        });
      }
    }

    return options;
  }, [produtos, produtoValue, produtoSelecionado]);

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
        // onSearchChange={setProdutosSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
      />
    </div>
  );
}
