"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  PROJETO_MEMORIA_SORT_OPTIONS,
  type ProjetoMemoriaSortField,
  type ProjetoMemoriaSortOrder,
  type ProjetoMemoriaSortState,
} from "@/components/projetos/tabela/projeto-memoria-sort";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Check } from "lucide-react";

export interface SortableFieldContextMenuProps {
  sortField: ProjetoMemoriaSortField;
  sort?: ProjetoMemoriaSortState;
  onSortChange?: (sort: ProjetoMemoriaSortState) => void;
  children: React.ReactNode;
  className?: string;
}

function SortContextMenuOption({
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
    <ContextMenuItem
      onSelect={onSelect}
      className="flex items-start gap-3 rounded-md px-2.5 py-2.5 cursor-pointer"
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          selected
            ? "border-primary/30 bg-primary/10 text-text-primary"
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
          "mt-1 h-4 w-4 shrink-0 text-text-primary",
          selected ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </ContextMenuItem>
  );
}

export function SortableFieldContextMenu({
  sortField,
  sort,
  onSortChange,
  children,
  className,
}: SortableFieldContextMenuProps) {
  if (!onSortChange) {
    return <>{children}</>;
  }

  const options = PROJETO_MEMORIA_SORT_OPTIONS[sortField];
  const isActive = sort?.sort_by === sortField;

  const handleSelect = (order: ProjetoMemoriaSortOrder) => {
    if (sort?.sort_by === sortField && sort?.sort_order === order) {
      onSortChange({});
      return;
    }
    onSortChange({ sort_by: sortField, sort_order: order });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[17.5rem] p-1.5">
        <SortContextMenuOption
          icon={ArrowUp}
          label={options.asc.label}
          hint={options.asc.hint}
          selected={isActive && sort?.sort_order === "ASC"}
          onSelect={() => handleSelect("ASC")}
        />
        <SortContextMenuOption
          icon={ArrowDown}
          label={options.desc.label}
          hint={options.desc.hint}
          selected={isActive && sort?.sort_order === "DESC"}
          onSelect={() => handleSelect("DESC")}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
