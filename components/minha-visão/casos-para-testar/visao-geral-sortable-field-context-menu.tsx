"use client";

import { Fragment } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import type { VisaoGeralStatusColumn } from "@/components/minha-visão/utils";
import type { VisaoGeralAgruparPor } from "@/services/sprint/get-visao-geral";

export type VisaoGeralSortOrder = "ASC" | "DESC";

export type VisaoGeralLabelSortField = "produto" | "campo";

export type VisaoGeralSortField =
  | VisaoGeralStatusColumn
  | VisaoGeralLabelSortField;

export interface VisaoGeralSortState {
  sort_by?: VisaoGeralSortField;
  sort_order?: VisaoGeralSortOrder;
}

export interface VisaoGeralSortOptionItem {
  label: string;
  hint: string;
}

export interface VisaoGeralSortColumnConfig {
  asc: VisaoGeralSortOptionItem;
  desc: VisaoGeralSortOptionItem;
}

const ALPHA_ASC_HINT = "Ordem alfabética crescente";
const ALPHA_DESC_HINT = "Ordem alfabética decrescente";
const QTY_ASC_HINT = "Menor quantidade primeiro";
const QTY_DESC_HINT = "Maior quantidade primeiro";

function alphaConfig(
  noun: string,
  ascendingSuffix: string,
  descendingSuffix: string,
): VisaoGeralSortColumnConfig {
  return {
    asc: {
      label: `Ordenar por ${noun} (${ascendingSuffix})`,
      hint: ALPHA_ASC_HINT,
    },
    desc: {
      label: `Ordenar por ${noun} (${descendingSuffix})`,
      hint: ALPHA_DESC_HINT,
    },
  };
}

function qtyConfig(noun: string): VisaoGeralSortColumnConfig {
  return {
    asc: {
      label: `Ordenar por ${noun} (Menor)`,
      hint: QTY_ASC_HINT,
    },
    desc: {
      label: `Ordenar por ${noun} (Maior)`,
      hint: QTY_DESC_HINT,
    },
  };
}

export const VISAO_GERAL_STATUS_SORT_OPTIONS: Record<
  VisaoGeralStatusColumn,
  VisaoGeralSortColumnConfig
> = {
  abertos: qtyConfig("Abertos"),
  aguardando_teste: qtyConfig("Aguardando teste"),
  retorno: qtyConfig("Retorno"),
  suspenso: qtyConfig("Suspenso"),
  resolvidos: qtyConfig("Resolvidos"),
};

export function getLabelSortFields(
  agruparPor: VisaoGeralAgruparPor,
): VisaoGeralLabelSortField[] {
  if (agruparPor === "produto") return ["campo"];
  if (agruparPor === "versao") return ["produto", "campo"];
  return ["campo", "produto"];
}

export function getLabelSortOptions(
  agruparPor: VisaoGeralAgruparPor,
): Record<VisaoGeralLabelSortField, VisaoGeralSortColumnConfig> {
  const produto = alphaConfig("Produto", "A-Z", "Z-A");

  if (agruparPor === "versao") {
    return {
      produto,
      campo: alphaConfig("Versão", "A-Z", "Z-A"),
    };
  }
  if (agruparPor === "produto") {
    return {
      produto,
      campo: alphaConfig("Produto", "A-Z", "Z-A"),
    };
  }
  if (agruparPor === "projeto") {
    return {
      produto,
      campo: alphaConfig("Projeto", "A-Z", "Z-A"),
    };
  }
  return {
    produto,
    campo: alphaConfig("Atribuído para", "A-Z", "Z-A"),
  };
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

interface VisaoGeralSortableFieldContextMenuProps {
  sortField?: VisaoGeralSortField;
  sortFields?: VisaoGeralSortField[];
  sortOptions: Partial<
    Record<VisaoGeralSortField, VisaoGeralSortColumnConfig>
  >;
  sort: VisaoGeralSortState;
  onSortChange: (sort: VisaoGeralSortState) => void;
  children: React.ReactNode;
  className?: string;
}

export function VisaoGeralSortableFieldContextMenu({
  sortField,
  sortFields,
  sortOptions,
  sort,
  onSortChange,
  children,
  className,
}: VisaoGeralSortableFieldContextMenuProps) {
  const fields = sortFields ?? (sortField ? [sortField] : []);

  const handleSelect = (field: VisaoGeralSortField, order: VisaoGeralSortOrder) => {
    if (sort.sort_by === field && sort.sort_order === order) {
      onSortChange({});
      return;
    }
    onSortChange({ sort_by: field, sort_order: order });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[17.5rem] p-1.5">
        {fields.map((field, index) => {
          const options = sortOptions[field];
          if (!options) return null;
          const fieldActive = sort.sort_by === field;

          return (
            <Fragment key={field}>
              {index > 0 ? <ContextMenuSeparator /> : null}
              <SortContextMenuOption
                icon={ArrowUp}
                label={options.asc.label}
                hint={options.asc.hint}
                selected={fieldActive && sort.sort_order === "ASC"}
                onSelect={() => handleSelect(field, "ASC")}
              />
              <SortContextMenuOption
                icon={ArrowDown}
                label={options.desc.label}
                hint={options.desc.hint}
                selected={fieldActive && sort.sort_order === "DESC"}
                onSelect={() => handleSelect(field, "DESC")}
              />
            </Fragment>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
