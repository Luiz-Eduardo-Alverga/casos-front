"use client";

import { useState, useMemo, useEffect } from "react";
import { Rocket } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { extractVersaoProduto } from "@/components/caso-form/shared/payload";

interface CasoFormVersaoProps {
  required?: boolean;
  todas?: boolean;
}

function versaoJaExisteNaLista(
  list: Array<{ value: string; label: string }>,
  candidate: string,
): boolean {
  const cand = candidate.trim();
  if (!cand) return true;

  const normCandidate = extractVersaoProduto(cand);
  return list.some((o) => {
    if (o.value === cand) return true;
    return extractVersaoProduto(o.value) === normCandidate;
  });
}

/** Alinha value curto do form (ex.: "7.1.1.0") ao value da opção (ex.: "42-7.1.1.0"). */
function findVersaoValueCanonica(
  list: Array<{ value: string; label: string }>,
  candidate: string,
): string | undefined {
  const cand = candidate.trim();
  if (!cand || !list.length) return undefined;

  if (list.some((o) => o.value === cand)) return undefined;

  const normCandidate = extractVersaoProduto(cand);
  return list.find((o) => extractVersaoProduto(o.value) === normCandidate)?.value;
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
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const produtoAtual = produtoValue || produto;

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produtoAtual,
    enabled: optionsRequested,
    todas,
  });

  const versoesOptions = useMemo(() => {
    const list = (versoes ?? []).map((v) => {
      const seq = String(v.sequencia ?? "").trim();
      const ver = String(v.versao ?? "").trim();
      const value =
        seq && ver ? `${seq}-${ver}` : ver || seq || String(v.id ?? "").trim();
      return {
        value,
        label: ver || seq || value,
      };
    });

    const produtoAlinhadoComItem =
      editCaseItem?.produto?.id != null &&
      String(produtoAtual) === String(editCaseItem.produto.id);

    const formVersao = String(versaoValue ?? "").trim();
    const fallbackVersao =
      formVersao ||
      (produtoAlinhadoComItem && editCaseItem?.produto?.versao
        ? String(editCaseItem.produto.versao).trim()
        : "");

    if (
      fallbackVersao &&
      !versaoJaExisteNaLista(list, fallbackVersao)
    ) {
      const label = extractVersaoProduto(fallbackVersao) || fallbackVersao;
      list.unshift({ value: fallbackVersao, label });
    }

    return list;
  }, [
    versoes,
    versaoValue,
    produtoAtual,
    editCaseItem?.produto?.id,
    editCaseItem?.produto?.versao,
  ]);

  // Sincroniza "7.1.1.0" (memória) com "seq-7.1.1.0" (opções) para o Combobox resolver selectedOption.
  useEffect(() => {
    const atual = String(versaoValue ?? "").trim();
    if (!atual || !versoes?.length) return;

    const canonico = findVersaoValueCanonica(versoesOptions, atual);
    if (canonico && canonico !== atual) {
      setValue("versao", canonico, { shouldDirty: false });
    }
  }, [versoesOptions, versaoValue, versoes, setValue]);

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
        // onSearchChange={setVersoesSearch}
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
