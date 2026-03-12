"use client";

import { useState, useMemo } from "react";
import { Rocket } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useVersoes } from "@/hooks/use-versoes";

interface CasoFormVersaoProps {
  required?: boolean;
}

export function CasoFormVersao({ required = true }: CasoFormVersaoProps) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);

  const produtoAtual = produtoValue || produto;

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produtoAtual,
    enabled: optionsRequested,
  });

  const versoesOptions = useMemo(() => {
    const list = (versoes ?? []).map((v, idx) => ({
      value: `${v.sequencia ?? ""}-${v.versao ?? ""}-${idx}`,
      label: v.versao,
    }));
    // Em modo lazy, opção apenas com dados da API (sem depender do estado do form)
    const versaoApi = editCaseItem?.produto?.versao;
    if (lazyLoadComboboxOptions && versaoApi != null && String(versaoApi).trim() !== "" && !list.some((o) => o.value === String(versaoApi))) {
      const value = String(versaoApi);
      list.unshift({ value, label: value });
    }
    return list;
  }, [versoes, lazyLoadComboboxOptions, editCaseItem?.produto?.versao]);

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
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
