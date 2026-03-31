"use client";

import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

interface ComboboxFieldProps {
  name: string;
  label: string;
  icon: LucideIcon;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  onSearchChange?: (search: string) => void;
  searchDebounceMs?: number;
  disabled?: boolean;
  required?: boolean;
  /** Quando true, dispara onOpenChange ao abrir/fechar (para lazy load de opções). */
  onOpenChange?: (open: boolean) => void;
  /** Controle de paginação infinita: se há mais páginas para carregar. */
  hasMore?: boolean;
  /** Controle de paginação infinita: se está carregando a próxima página. */
  isLoadingMore?: boolean;
  /** Chamado quando o usuário chega ao final da lista (para carregar mais). */
  onLoadMore?: () => void;
}

export function ComboboxField({
  name,
  label,
  icon: Icon,
  options,
  placeholder = "Selecione...",
  emptyText,
  onSearchChange,
  searchDebounceMs,
  disabled = false,
  required = false,
  onOpenChange,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ComboboxFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-text-label">
          {label} {required && <span className="text-text-error">*</span>}
        </Label>

        {error && (
          <p className="text-sm text-destructive">{error.message as string}</p>
        )}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value ?? ""}
            onValueChange={(v) => field.onChange(v ?? "")}
            placeholder={placeholder}
            emptyText={emptyText}
            onSearchChange={onSearchChange}
            searchDebounceMs={searchDebounceMs}
            disabled={disabled}
            onOpenChange={onOpenChange}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            anchorClassName={cn("group", "[&_button]:border-border-input")}
            className={cn(
              field.value && "rounded-l-lg rounded-r-none border-r-0",
              !field.value && "rounded-lg",
            )}
            suffix={
              field.value ? (
                <Button
                  tabIndex={-1}
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-l-none border-l-0 -ml-px rounded-r-lg border-border-input",
                    "group-hover:bg-accent group-hover:text-accent-foreground",
                    "group-focus-within:ring-1 group-focus-within:ring-ring",
                  )}
                  onClick={() => field.onChange("")}
                  disabled={disabled}
                  aria-label="Remover seleção"
                >
                  <X className="h-4 w-4 opacity-50" />
                </Button>
              ) : null
            }
          />
        )}
      />
    </div>
  );
}
