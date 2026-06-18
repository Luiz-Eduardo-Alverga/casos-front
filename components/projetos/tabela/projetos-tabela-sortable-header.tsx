"use client";

import { TableHead } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROJETO_MEMORIA_SORT_OPTIONS,
  type ProjetoMemoriaSortField,
  type ProjetoMemoriaSortOrder,
  type ProjetoMemoriaSortState,
} from "@/components/projetos/tabela/projeto-memoria-sort";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, Check } from "lucide-react";

export interface ProjetosTabelaSortableHeaderProps {
  label: string;
  sortField: ProjetoMemoriaSortField;
  sort?: ProjetoMemoriaSortState;
  onSortChange?: (sort: ProjetoMemoriaSortState) => void;
  className?: string;
}

function SortMenuOption({
  icon: Icon,
  label,
  hint,
  selected,
  onSelect,
}: {
  icon: typeof ArrowUp;
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className="flex items-start gap-3 rounded-md px-2.5 py-2.5 cursor-pointer"
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          selected
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border-divider bg-muted/50 text-text-secondary",
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block text-xs font-medium leading-snug text-popover-foreground">
          {label}
        </span>
        <span className="block text-xs leading-snug text-muted-foreground">
          {hint}
        </span>
      </span>
      <Check
        className={cn(
          "mt-1 h-4 w-4 shrink-0 text-primary",
          selected ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </DropdownMenuItem>
  );
}

export function ProjetosTabelaSortableHeader({
  label,
  sortField,
  sort,
  onSortChange,
  className,
}: ProjetosTabelaSortableHeaderProps) {
  const isActive = sort?.sort_by === sortField;
  const options = PROJETO_MEMORIA_SORT_OPTIONS[sortField];

  const handleSelect = (order: ProjetoMemoriaSortOrder) => {
    onSortChange?.({ sort_by: sortField, sort_order: order });
  };

  const SortIcon = isActive
    ? sort?.sort_order === "ASC"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead
      className={cn(
        "font-medium text-sm text-text-primary h-auto py-4 px-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            isActive && "text-primary",
          )}
        >
          {label}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-text-secondary",
              )}
              aria-label={`Ordenar por ${label}`}
            >
              <SortIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[17.5rem] p-1.5">
            <SortMenuOption
              icon={ArrowUp}
              label={options.asc.label}
              hint={options.asc.hint}
              selected={isActive && sort?.sort_order === "ASC"}
              onSelect={() => handleSelect("ASC")}
            />
            <SortMenuOption
              icon={ArrowDown}
              label={options.desc.label}
              hint={options.desc.hint}
              selected={isActive && sort?.sort_order === "DESC"}
              onSelect={() => handleSelect("DESC")}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
}
