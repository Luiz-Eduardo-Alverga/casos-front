"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ComboboxOption } from "@/components/ui/combobox";
import {
  getImportancias,
  type AuxiliarImportancia,
} from "@/services/auxiliar/importancias";

/** Filtro / query param `tipo` na API auxiliar (`/auxiliar/importancias?tipo=`). */
export type AuxiliarImportanciaTipoFilter = "CASO" | "REPORT";

const DESCRICAO_PT: Record<string, string> = {
  Medio: "Médio",
  Critico: "Crítico",
};

function opcaoImportancia(
  item: AuxiliarImportancia,
  apiTipo: AuxiliarImportanciaTipoFilter,
): ComboboxOption {
  if (apiTipo === "REPORT") {
    return {
      value: item.report_importancia_equivalente,
      label: DESCRICAO_PT[item.descricao] ?? item.descricao,
    };
  }

  const labelTipoPrioridade =
    typeof item.TipoPrioridade === "string"
      ? item.TipoPrioridade.trim()
      : item.TipoPrioridade != null
        ? String(item.TipoPrioridade).trim()
        : "";
  const label =
    labelTipoPrioridade !== ""
      ? labelTipoPrioridade
      : item.descricao
        ? (DESCRICAO_PT[item.descricao] ?? item.descricao)
        : String(item.Registro);
  return {
    value: String(item.nivel),
    label,
  };
}

/** Monta `{ value, label }[]` a partir da resposta da API (REPORT usa `descricao`; CASO usa `TipoPrioridade`). */
export function auxiliarImportanciasParaCombobox(
  items: AuxiliarImportancia[],
  apiTipo: AuxiliarImportanciaTipoFilter,
): ComboboxOption[] {
  const sorted =
    apiTipo === "REPORT"
      ? [...items].sort(
          (a, b) =>
            Number(a.report_importancia_equivalente) -
            Number(b.report_importancia_equivalente),
        )
      : [...items].sort((a, b) => Number(a.nivel) - Number(b.nivel));

  return sorted.map((row) => opcaoImportancia(row, apiTipo));
}

export function useImportancias(params: {
  tipo: AuxiliarImportanciaTipoFilter;
  enabled?: boolean;
}) {
  const enabled = params.enabled ?? true;
  const tipoApi = params.tipo;

  const query = useQuery({
    queryKey: ["importancias", tipoApi],
    queryFn: () => getImportancias({ tipo: tipoApi }),
    enabled: enabled && Boolean(tipoApi),
  });

  const options: ComboboxOption[] = useMemo(() => {
    return auxiliarImportanciasParaCombobox(query.data ?? [], tipoApi);
  }, [query.data, tipoApi]);

  return { ...query, options };
}
