"use client";

import { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { Rocket } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import {
  buildVersaoComboboxOptionsWithEditFallback,
  findSequenciaByVersaoProduto,
  isSequenciaNoCatalogo,
  mergeEditVersaoIntoCatalog,
} from "@/components/casos/shared/versao-combobox";

interface CasoFormVersaoProps {
  required?: boolean;
  todas?: boolean;
}

export function CasoFormVersao({
  required = true,
  todas = false,
}: CasoFormVersaoProps) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } =
    useCasoForm();
  const { watch, setValue } = useFormContext();
  const produtoValue = watch("produto");
  const versaoValue = watch("versao");
  const versaoValueTrimmed = String(versaoValue ?? "").trim();
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions || Boolean(versaoValueTrimmed),
  );

  useEffect(() => {
    if (!lazyLoadComboboxOptions) return;
    if (optionsRequested) return;

    if (versaoValueTrimmed) setOptionsRequested(true);
  }, [lazyLoadComboboxOptions, optionsRequested, versaoValueTrimmed]);

  const produtoAtual = produtoValue || produto;

  const editVersaoFallback = useMemo(() => {
    const produtoAlinhado =
      editCaseItem?.produto?.id != null &&
      String(produtoAtual) === String(editCaseItem.produto.id);
    if (!produtoAlinhado) return undefined;

    return {
      versaoProduto: editCaseItem.produto.versao,
      formVersaoValue: versaoValueTrimmed,
      produtoId: String(editCaseItem.produto.id),
      formProdutoId: String(produtoAtual),
    };
  }, [
    editCaseItem?.produto?.id,
    editCaseItem?.produto?.versao,
    produtoAtual,
    versaoValueTrimmed,
  ]);

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produtoAtual,
    enabled: optionsRequested,
    todas,
  });

  const versoesComFallback = useMemo(
    () => mergeEditVersaoIntoCatalog(versoes ?? [], editVersaoFallback),
    [versoes, editVersaoFallback],
  );

  const versoesOptions = useMemo(
    () =>
      buildVersaoComboboxOptionsWithEditFallback(
        versoes ?? [],
        editVersaoFallback,
      ),
    [versoes, editVersaoFallback],
  );

  // Rede de segurança: alinha texto → sequencia antes da pintura (após reset do pai).
  useLayoutEffect(() => {
    if (!versoesComFallback.length || !versaoValueTrimmed) return;
    if (isSequenciaNoCatalogo(versaoValueTrimmed, versoesComFallback)) return;

    const produtoAlinhadoComItem =
      editCaseItem?.produto?.id != null &&
      String(produtoAtual) === String(editCaseItem.produto.id);

    const candidatos = [
      versaoValueTrimmed,
      produtoAlinhadoComItem && editCaseItem?.produto?.versao
        ? String(editCaseItem.produto.versao).trim()
        : "",
    ].filter(Boolean);

    for (const candidato of candidatos) {
      const sequencia = findSequenciaByVersaoProduto(
        versoesComFallback,
        candidato,
      );
      if (sequencia && sequencia !== versaoValueTrimmed) {
        setValue("versao", sequencia, { shouldDirty: false });
        break;
      }
    }
  }, [
    versoesComFallback,
    versaoValueTrimmed,
    setValue,
    produtoAtual,
    editCaseItem?.produto?.id,
    editCaseItem?.produto?.versao,
  ]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="versao"
        label="Versão do Produto"
        icon={Rocket}
        options={versoesOptions}
        placeholder={
          produtoAtual
            ? "Selecione a versão..."
            : "Selecione o produto primeiro."
        }
        emptyText={
          !produtoAtual
            ? "Selecione o produto primeiro."
            : isVersoesLoading
              ? "Carregando versões..."
              : "Nenhuma versão encontrada."
        }
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual}
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
