"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import {
  resolveComboboxLazyLoad,
  useCasoForm,
} from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import type { Produto } from "@/services/auxiliar/produtos";

interface CasoFormProdutoProps {
  required?: boolean;
  onlyWithPoQaConfigured?: boolean;
  hideLabel?: boolean;
  valueLabelPrefix?: string;
  wrapperClassName?: string;
}

export function CasoFormProduto({
  required = true,
  onlyWithPoQaConfigured = false,
  hideLabel = false,
  valueLabelPrefix,
  wrapperClassName,
}: CasoFormProdutoProps) {
  const {
    isDisabled,
    lazyLoadComboboxOptions,
    eagerLoadComboboxFieldNames,
    editCaseItem,
  } = useCasoForm();
  const lazyLoad = resolveComboboxLazyLoad(
    { lazyLoadComboboxOptions, eagerLoadComboboxFieldNames },
    "produto",
  );
  const { watch, setValue } = useFormContext();
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoad);
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
          label: p.nome_projeto?.trim() || `Produto ${p.id}`,
        });
      });
    }

    if (produtoValue && produtoSelecionado) {
      const produtoValueStr = String(produtoSelecionado.id);
      const nome =
        produtoSelecionado.nome_projeto?.trim() ||
        `Produto ${produtoSelecionado.id}`;
      const setor = produtoSelecionado.setor?.trim();
      const produtoLabel = setor ? `${nome} - ${setor}` : nome;
      if (!options.some((opt) => opt.value === produtoValueStr)) {
        options.unshift({ value: produtoValueStr, label: produtoLabel });
      }
    }

    if (
      lazyLoad &&
      editCaseItem?.produto &&
      produtoValue &&
      !options.some((o) => o.value === produtoValue)
    ) {
      const p = editCaseItem.produto;
      options.unshift({
        value: String(p.id),
        label: p.nome?.trim() || `Produto ${p.id}`,
      });
    }

    return options;
  }, [
    produtos,
    produtoValue,
    produtoSelecionado,
    lazyLoad,
    editCaseItem,
    onlyWithPoQaConfigured,
  ]);

  // Quando o produto é selecionado, buscar e salvar os dados completos.
  // Limpa versão/projeto/módulo ao trocar ou remover o produto (não no mount inicial
  // nem quando o valor veio de reset/sincronização com a API na edição).
  useEffect(() => {
    const prev = prevProdutoValueRef.current;
    const prevHadValue = Boolean(prev && String(prev).trim() !== "");
    const produtoMudou =
      prevHadValue &&
      Boolean(produtoValue && String(produtoValue).trim() !== "") &&
      String(prev) !== String(produtoValue);

    const isFormProdutoAlignedWithItem =
      lazyLoad &&
      editCaseItem?.produto?.id != null &&
      String(produtoValue) === String(editCaseItem.produto.id);

    prevProdutoValueRef.current = produtoValue || undefined;

    if (produtoMudou && !isFormProdutoAlignedWithItem) {
      setValue("versao", "");
      setValue("projeto", "");
      setValue("modulo", "");
    }

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
  }, [
    produtoValue,
    produtos,
    setValue,
    lazyLoad,
    editCaseItem,
  ]);

  return (
    <div className="">
      <ComboboxField
        name="produto"
        label="Produto"
        icon={BriefcaseBusiness}
        options={produtosOptions}
        placeholder="Selecione o produto..."
        emptyText="Nenhum produto encontrado."
        isLoading={optionsRequested && isProdutosLoading}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        hideLabel={hideLabel}
        valueLabelPrefix={valueLabelPrefix}
        wrapperClassName={wrapperClassName}
        onOpenChange={
          lazyLoad
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
