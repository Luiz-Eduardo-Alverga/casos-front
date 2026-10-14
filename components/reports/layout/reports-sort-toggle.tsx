"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportsSort } from "../filtros/reports-filtros-locais";

const SORT_OPTIONS: Array<{ id: ReportsSort; label: string }> = [
  { id: "prazo", label: "Prazo" },
  { id: "criticidade", label: "Criticidade" },
  { id: "abertura", label: "Mais antigos" },
];

interface ReportsSortToggleProps {
  sort: ReportsSort;
  onChange: (sort: ReportsSort) => void;
}

export function ReportsSortToggle({ sort, onChange }: ReportsSortToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-text-secondary">Ordenar por</span>
      <div
        className="flex w-fit gap-0.5 rounded-md border border-border-divider bg-card p-0.5"
        role="group"
        aria-label="Ordenar por"
      >
        {SORT_OPTIONS.map((option) => {
          const active = sort === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={active}
              className={cn(
                "h-7 px-2 text-xs",
                active &&
                  "bg-brand-yellow text-text-primary hover:bg-brand-yellow hover:text-text-primary",
              )}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
