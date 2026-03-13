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
          <div className="flex items-center">
            <div
              className={cn(
                "flex-1 min-w-0 [&_button]:border-border-input",
                field.value
                  ? "[&_button]:rounded-l-lg [&_button]:rounded-r-none [&_button]:border-r-0"
                  : "[&_button]:rounded-lg",
              )}
            >
              <Combobox
                options={options}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={placeholder}
                emptyText={emptyText}
                onSearchChange={onSearchChange}
                searchDebounceMs={searchDebounceMs}
                disabled={disabled}
                onOpenChange={onOpenChange}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
              />
            </div>
            {field.value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-l-none border-l-0 rounded-r-lg border-border-input"
                onClick={() => field.onChange(undefined)}
                disabled={disabled}
                aria-label="Remover seleção"
              >
                <X className="h-4 w-4 opacity-50" />
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
}
