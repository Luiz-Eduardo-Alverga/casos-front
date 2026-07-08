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
  /** Mensagem enquanto o debounce da busca está pendente. */
  searchDebounceText?: string;
  /** Comprimento mínimo do termo para exibir a mensagem de debounce. */
  minSearchLengthForDebounceFeedback?: number;
  disabled?: boolean;
  required?: boolean;
  /** Quando true, dispara onOpenChange ao abrir/fechar (para lazy load de opções). */
  onOpenChange?: (open: boolean) => void;
  /** Carregamento inicial das opções (ex.: lazy load ao abrir). */
  isLoading?: boolean;
  /** Quantidade de linhas do skeleton durante o carregamento inicial. */
  loadingSkeletonRows?: number;
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
  /** Chamado após o react-hook-form atualizar o valor (modo `name`). */
  onAfterValueChange?: (value: string) => void;
}

/**
 * Botão de limpar exibido dentro do mesmo container do gatilho do Combobox.
 * É "naked" (ghost, sem borda/sombra/ring): hover e foco ficam unificados no
 * container do Combobox, então gatilho + X parecem um único controle.
 */
function ClearButton({
  onClear,
  disabled,
}: {
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      tabIndex={-1}
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        // h-full: estica para a altura do container (definida via anchorClassName),
        // evitando somar a borda do container e aumentar o controle.
        "h-full w-9 shrink-0 rounded-none border-0 bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent",
      )}
      // Evita roubar o foco (e o ring) ao clicar; o foco fica no gatilho.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClear}
      disabled={disabled}
      aria-label="Remover seleção"
    >
      <X className="h-4 w-4 opacity-50" />
    </Button>
  );
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
  searchDebounceText,
  minSearchLengthForDebounceFeedback,
  disabled = false,
  required = false,
  onOpenChange,
  isLoading,
  loadingSkeletonRows,
  hasMore,
  isLoadingMore,
  onLoadMore,
  hideLabel = false,
  wrapperClassName,
  controlHeightClassName = "h-9",
  valueLabelPrefix,
  onAfterValueChange,
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
            searchDebounceText={searchDebounceText}
            minSearchLengthForDebounceFeedback={
              minSearchLengthForDebounceFeedback
            }
            disabled={disabled}
            onOpenChange={onOpenChange}
            isLoading={isLoading}
            loadingSkeletonRows={loadingSkeletonRows}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            valueLabelPrefix={valueLabelPrefix}
            className={controlHeightClassName}
            suffix={
              value ? (
                <ClearButton
                  onClear={() => onValueChange("")}
                  disabled={disabled}
                />
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
          searchDebounceText={searchDebounceText}
          minSearchLengthForDebounceFeedback={
            minSearchLengthForDebounceFeedback
          }
          disabled={disabled}
          onOpenChange={onOpenChange}
          isLoading={isLoading}
          loadingSkeletonRows={loadingSkeletonRows}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          controlHeightClassName={controlHeightClassName}
          valueLabelPrefix={valueLabelPrefix}
          onAfterValueChange={onAfterValueChange}
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
  searchDebounceText,
  minSearchLengthForDebounceFeedback,
  disabled,
  onOpenChange,
  isLoading,
  loadingSkeletonRows,
  hasMore,
  isLoadingMore,
  onLoadMore,
  controlHeightClassName = "h-9",
  valueLabelPrefix,
  onAfterValueChange,
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
            value={field.value != null ? String(field.value) : ""}
            onValueChange={(v) => {
              const next = v ?? "";
              field.onChange(next);
              onAfterValueChange?.(next);
            }}
            placeholder={placeholder}
            emptyText={emptyText}
            onSearchChange={onSearchChange}
            searchDebounceMs={searchDebounceMs}
            searchDebounceText={searchDebounceText}
            minSearchLengthForDebounceFeedback={
              minSearchLengthForDebounceFeedback
            }
            disabled={disabled}
            onOpenChange={onOpenChange}
            isLoading={isLoading}
            loadingSkeletonRows={loadingSkeletonRows}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            valueLabelPrefix={valueLabelPrefix}
            className={controlHeightClassName}
            suffix={
              field.value ? (
                <ClearButton
                  onClear={() => field.onChange("")}
                  disabled={disabled}
                />
              ) : null
            }
          />
        )}
      />
    </>
  );
}
