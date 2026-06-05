"use client";

import { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { Rocket } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import {
  buildVersaoComboboxOptions,
  findSequenciaByVersaoProduto,
  isSequenciaNoCatalogo,
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

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produtoAtual,
    enabled: optionsRequested,
    todas,
  });

  const versoesOptions = useMemo(
    () => buildVersaoComboboxOptions(versoes ?? []),
    [versoes],
  );

  // Rede de segurança: alinha texto → sequencia antes da pintura (após reset do pai).
  useLayoutEffect(() => {
    if (!versoes?.length || !versaoValueTrimmed) return;
    if (isSequenciaNoCatalogo(versaoValueTrimmed, versoes)) return;

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
      const sequencia = findSequenciaByVersaoProduto(versoes, candidato);
      if (sequencia && sequencia !== versaoValueTrimmed) {
        setValue("versao", sequencia, { shouldDirty: false });
        break;
      }
    }
  }, [
    versoes,
    versaoValueTrimmed,
    setValue,
    produtoAtual,
    editCaseItem?.produto?.id,
    editCaseItem?.produto?.versao,
  ]);

  // Diagnóstico em produção: form tem valor mas Combobox não resolve selectedOption.
  useEffect(() => {
    if (!versaoValueTrimmed || !produtoAtual || isVersoesLoading) return;

    const hasExactMatch = versoesOptions.some(
      (o) => o.value === versaoValueTrimmed,
    );
    if (hasExactMatch) return;

    console.log("[CasoFormVersao] sequência sem opção correspondente", {
      versaoForm: versaoValue,
      versaoFormTrimmed: versaoValueTrimmed,
      produtoAtual,
      optionsRequested,
      versoesCarregadas: versoes?.length ?? 0,
      optionsCount: versoesOptions.length,
      optionsValues: versoesOptions.map((o) => o.value),
      editCaseItemVersao: editCaseItem?.produto?.versao,
      casoId: editCaseItem?.caso?.id,
      lazyLoadComboboxOptions,
      isVersoesLoading,
      versoesRaw: versoes?.map((v) => ({
        sequencia: v.sequencia,
        versao: v.versao,
      })),
      optionsLabels: versoesOptions.map((o) => o.label),
      sequenciaResolvida: findSequenciaByVersaoProduto(
        versoes ?? [],
        versaoValueTrimmed,
      ),
    });
  }, [
    versaoValue,
    versaoValueTrimmed,
    versoesOptions,
    produtoAtual,
    optionsRequested,
    versoes,
    editCaseItem?.produto?.versao,
    editCaseItem?.caso?.id,
    lazyLoadComboboxOptions,
    isVersoesLoading,
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
