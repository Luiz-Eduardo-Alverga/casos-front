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
  const { produto, isDisabled } = useCasoForm();
  const { watch } = useFormContext();
  const produtoValue = watch("produto");
  // const [versoesSearch, setVersoesSearch] = useState<string>("");

  const produtoAtual = produtoValue || produto;

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produtoAtual,
    // search: versoesSearch.trim() || undefined,
  });

  const versoesOptions = useMemo(() => {
    // garantir um `value` único por opção (o Combobox usa `value` como `key`).
    return (versoes ?? []).map((v, idx) => ({
      value: `${v.sequencia ?? ""}-${v.versao ?? ""}-${idx}`,
      label: v.versao,
    }));
  }, [versoes]);

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
      />
    </div>
  );
}
