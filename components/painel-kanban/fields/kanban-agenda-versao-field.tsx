"use client";

import { useEffect, useMemo } from "react";
import { BriefcaseBusiness, GitBranch } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useFormContext } from "react-hook-form";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";

interface PainelKanbanAgendaFieldsProps {
  agendaItems: AgendaDevItem[];
  disabled?: boolean;
}

export function PainelKanbanAgendaVersaoField({
  agendaItems,
  disabled = false,
}: PainelKanbanAgendaFieldsProps) {
  const { watch, setValue } = useFormContext<PainelKanbanFiltrosForm>();
  const produtoId = watch("produto");
  const versao = watch("versao");

  const options = useMemo(() => {
    const pid = produtoId?.trim();
    if (!pid) return [];
    const set = new Set<string>();
    for (const item of agendaItems) {
      if (String(item.id_produto) === pid && item.versao?.trim()) {
        set.add(item.versao.trim());
      }
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((v) => ({ value: v, label: v }));
  }, [agendaItems, produtoId]);

  useEffect(() => {
    if (!produtoId?.trim()) {
      if (versao) setValue("versao", "");
      return;
    }
    if (options.length === 0) {
      if (versao) setValue("versao", "");
      return;
    }
    if (!versao || !options.some((o) => o.value === versao)) {
      setValue("versao", options[0]?.value ?? "");
    }
  }, [produtoId, options, versao, setValue]);

  const disabledCombined = disabled || !produtoId?.trim();

  return (
    <div className="space-y-2">
      <ComboboxField
        name="versao"
        label="Versão"
        icon={GitBranch}
        options={options}
        placeholder="Selecione a versão..."
        emptyText={
          !produtoId?.trim()
            ? "Selecione um produto primeiro."
            : options.length === 0
              ? "Nenhuma versão na agenda para este produto."
              : "Nenhum resultado."
        }
        disabled={disabledCombined}
        searchDebounceMs={450}
        required={false}
      />
    </div>
  );
}
