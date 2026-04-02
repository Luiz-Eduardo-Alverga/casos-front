"use client";

import { useMemo } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";

interface PainelKanbanAgendaFieldsProps {
  agendaItems: AgendaDevItem[];
  disabled?: boolean;
}

export function PainelKanbanAgendaProdutoField({
  agendaItems,
  disabled = false,
}: PainelKanbanAgendaFieldsProps) {
  const options = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of agendaItems) {
      const id = String(item.id_produto);
      if (!map.has(id)) {
        map.set(id, item.produto?.trim() || `Produto ${id}`);
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [agendaItems]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="produto"
        label="Produto"
        icon={BriefcaseBusiness}
        options={options}
        placeholder="Selecione o produto..."
        emptyText={
          agendaItems.length === 0
            ? "Nenhum produto priorizado na agenda."
            : "Nenhum resultado."
        }
        disabled={disabled}
        searchDebounceMs={450}
        required={false}
      />
    </div>
  );
}
