"use client";

import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

interface ComboboxFieldProps {
  /**
   * Nome do campo no react-hook-form.
   * Se `value`/`onValueChange` forem informados, `name` é opcional (modo controlado).
   */
  name?: string;
  label: string;
  icon: LucideIcon;
  options: ComboboxOption[];
  /** Modo controlado (sem react-hook-form). */
  value?: string;
  /** Modo controlado (sem react-hook-form). */
  onValueChange?: (value: string) => void;
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
  /** Esconde o label externo; útil em headers compactos. */
  hideLabel?: boolean;
  /** Classes no container raiz do campo. */
  wrapperClassName?: string;
  /** Classe de altura aplicada ao combobox e ao botão de limpar (padrão: h-9). */
  controlHeightClassName?: string;
  /** Prefixo exibido apenas no gatilho quando há valor selecionado. */
  valueLabelPrefix?: string;
}

export function ComboboxField({
  name,
  label,
  icon: Icon,
  options,
  value,
  onValueChange,
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
  hideLabel = false,
  wrapperClassName,
  controlHeightClassName = "h-9",
  valueLabelPrefix,
}: ComboboxFieldProps) {
  const isControlled = typeof onValueChange === "function";

  return (
    <div
      className={cn(hideLabel ? "space-y-0" : "space-y-2", wrapperClassName)}
    >
      {isControlled ? (
        <>
          {!hideLabel && (
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-text-label">
                {label} {required && <span className="text-text-error">*</span>}
              </Label>
            </div>
          )}
          <Combobox
            options={options}
            value={value ?? ""}
            onValueChange={(v) => onValueChange(v ?? "")}
            placeholder={placeholder}
            emptyText={emptyText}
            onSearchChange={onSearchChange}
            searchDebounceMs={searchDebounceMs}
            disabled={disabled}
            onOpenChange={onOpenChange}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            valueLabelPrefix={valueLabelPrefix}
            anchorClassName={cn("group", "[&_button]:border-border-input")}
            className={cn(
              controlHeightClassName,
              value &&
                "rounded-l-lg rounded-r-none border-r-0 dark:border-input",
              !value && "rounded-lg",
            )}
            suffix={
              value ? (
                <Button
                  tabIndex={-1}
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-9 shrink-0 rounded-l-none border-l-0 -ml-px rounded-r-lg border-border-input dark:border-input focus:ring-0",
                    controlHeightClassName,
                    "group-hover:bg-accent group-hover:text-accent-foreground",
                    "group-focus-within:ring-1 group-focus-within:ring-ring",
                  )}
                  onClick={() => onValueChange("")}
                  disabled={disabled}
                  aria-label="Remover seleção"
                >
                  <X className="h-4 w-4 opacity-50" />
                </Button>
              ) : null
            }
          />
        </>
      ) : name ? (
        <RHFComboboxField
          name={name}
          label={label}
          required={required}
          hideLabel={hideLabel}
          options={options}
          placeholder={placeholder}
          emptyText={emptyText}
          onSearchChange={onSearchChange}
          searchDebounceMs={searchDebounceMs}
          disabled={disabled}
          onOpenChange={onOpenChange}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          controlHeightClassName={controlHeightClassName}
          valueLabelPrefix={valueLabelPrefix}
        />
      ) : null}
    </div>
  );
}

function RHFComboboxField({
  name,
  label,
  required,
  hideLabel,
  options,
  placeholder,
  emptyText,
  onSearchChange,
  searchDebounceMs,
  disabled,
  onOpenChange,
  hasMore,
  isLoadingMore,
  onLoadMore,
  controlHeightClassName = "h-9",
  valueLabelPrefix,
}: Omit<
  ComboboxFieldProps,
  "icon" | "value" | "onValueChange" | "wrapperClassName"
> & {
  name: string;
}) {
  const rhf = useFormContext();
  const error = (rhf.formState.errors as any)?.[name];

  return (
    <>
      {!hideLabel && (
        <div className="flex justify-between">
          <Label className="text-sm font-medium text-text-label">
            {label} {required && <span className="text-text-error">*</span>}
          </Label>
          {error && (
            <p className="text-sm text-destructive">
              {error.message as string}
            </p>
          )}
        </div>
      )}
      {hideLabel && error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
      <Controller
        name={name}
        control={rhf.control}
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
            valueLabelPrefix={valueLabelPrefix}
            anchorClassName={cn("group", "[&_button]:border-border-input")}
            className={cn(
              controlHeightClassName,
              field.value &&
                "rounded-l-lg rounded-r-none border-r-0 dark:border-input",
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
                    "w-9 shrink-0 rounded-l-none border-l-0 -ml-px rounded-r-lg border-border-input dark:border-input",
                    controlHeightClassName,
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
    </>
  );
}
