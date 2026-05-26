"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import type { Produto } from "@/services/auxiliar/produtos";

interface CasoFormProdutoProps {
  required?: boolean;
  onlyWithPoQaConfigured?: boolean;
}

export function CasoFormProduto({
  required = true,
  onlyWithPoQaConfigured = false,
}: CasoFormProdutoProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch, setValue } = useFormContext();
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );
  const prevProdutoValueRef = useRef<string | undefined>(undefined);

  const { data: produtos, isLoading: isProdutosLoading } = useProdutos({
    enabled: optionsRequested,
  });

  const produtosOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    if (produtos && Array.isArray(produtos)) {
      let list = produtos.filter(isProdutoAtivo);
      if (onlyWithPoQaConfigured) {
        list = list.filter(hasPoQaConfigured);
      }
      list.forEach((p) => {
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

    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.produto &&
      produtoValue &&
      !options.some((o) => o.value === produtoValue)
    ) {
      const p = editCaseItem.produto;
      options.unshift({ value: String(p.id), label: p.nome });
    }

    return options;
  }, [
    produtos,
    produtoValue,
    produtoSelecionado,
    lazyLoadComboboxOptions,
    editCaseItem,
    onlyWithPoQaConfigured,
  ]);

  // Quando o produto é selecionado, buscar e salvar os dados completos.
  // Só limpa versão/projeto/módulo quando o usuário remove o produto (não no mount inicial vazio antes do reset da URL).
  useEffect(() => {
    const prev = prevProdutoValueRef.current;
    prevProdutoValueRef.current = produtoValue || undefined;

    if (produtoValue && produtos && Array.isArray(produtos)) {
      const produtoEncontrado = produtos.find(
        (p) => String(p.id) === produtoValue,
      );
      if (produtoEncontrado) {
        setProdutoSelecionado(produtoEncontrado);
      }
      return;
    }

    if (!produtoValue) {
      setProdutoSelecionado(null);
      const tinhaProduto = Boolean(prev && String(prev).trim() !== "");
      if (tinhaProduto) {
        setValue("versao", "");
        setValue("projeto", "");
        setValue("modulo", "");
      }
    }
  }, [produtoValue, produtos, setValue]);

  return (
    <div className="">
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
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}

function isConfiguredId(value: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized !== "" && normalized !== "0";
}

/** Produto ativo quando `desativado` é `"0"` (mesmo padrão da API de status). */
function isProdutoAtivo(produto: Produto) {
  return String(produto.desativado ?? "").trim() === "0";
}

function hasPoQaConfigured(produto: Produto) {
  return (
    isConfiguredId(produto.responsavel_bugs_suporte_id) &&
    isConfiguredId(produto.responsavel_melhorias_suporte_id)
  );
}
