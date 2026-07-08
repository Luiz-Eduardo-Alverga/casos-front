"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onSearchChange?: (search: string) => void;
  searchDebounceMs?: number;
  /**
   * Mensagem exibida enquanto o debounce da busca está pendente.
   * Quando omitida e `onSearchChange` estiver definido, usa texto padrão.
   */
  searchDebounceText?: string;
  /**
   * Comprimento mínimo do termo digitado para exibir `searchDebounceText`.
   * Padrão: 1.
   */
  minSearchLengthForDebounceFeedback?: number;
  className?: string;
  disabled?: boolean;
  /** Chamado quando o popover abre ou fecha (para lazy load de opções). */
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
  /**
   * Conteúdo após o gatilho (ex.: botão limpar), dentro da mesma âncora do Popover
   * para o painel usar a largura do grupo inteiro (Radix: --radix-popover-trigger-width
   * segue a âncora quando há PopoverAnchor).
   */
  suffix?: ReactNode;
  /** Classes no container flex que envolve gatilho + suffix. */
  anchorClassName?: string;
  /**
   * Prefixo exibido apenas no texto do gatilho quando há valor selecionado.
   * Não altera os labels da lista de opções.
   *
   * Ex.: `Ver como: `
   */
  valueLabelPrefix?: string;
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Menor score = maior relevância na busca. */
function getSearchRelevanceScore(label: string, search: string): number {
  const labelNorm = normalizeForSearch(label);
  const searchNorm = normalizeForSearch(search);
  if (!searchNorm) return 0;

  if (labelNorm === searchNorm) return 0;
  if (labelNorm.startsWith(searchNorm)) return 1;

  const boundaryPatterns = [
    ` ${searchNorm}`,
    `-${searchNorm}`,
    `_${searchNorm}`,
    `(${searchNorm}`,
  ];
  if (boundaryPatterns.some((pattern) => labelNorm.includes(pattern))) {
    return 2;
  }

  const index = labelNorm.indexOf(searchNorm);
  if (index === -1) return Number.POSITIVE_INFINITY;

  return 10 + index;
}

function ComboboxSearchDebounceMessage({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-70" />
      <span>{message}</span>
    </div>
  );
}

function ComboboxOptionsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-1" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5"
        >
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton
            className="h-4"
            style={{ width: `${55 + (index % 3) * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function filterAndSortComboboxOptions(
  options: ComboboxOption[],
  searchValue: string,
): ComboboxOption[] {
  const searchNorm = normalizeForSearch(searchValue);
  if (!searchNorm) return options;

  return options
    .filter((option) =>
      normalizeForSearch(option.label ?? "").includes(searchNorm),
    )
    .sort((a, b) => {
      const scoreA = getSearchRelevanceScore(a.label ?? "", searchValue);
      const scoreB = getSearchRelevanceScore(b.label ?? "", searchValue);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (a.label?.length ?? 0) - (b.label?.length ?? 0);
    });
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Pesquisar...",
  emptyText = "Nenhum resultado encontrado.",
  onSearchChange,
  searchDebounceMs = 400,
  searchDebounceText,
  minSearchLengthForDebounceFeedback = 1,
  className,
  disabled = false,
  onOpenChange,
  isLoading = false,
  loadingSkeletonRows = 5,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  suffix,
  anchorClassName,
  valueLabelPrefix = "",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isDebouncingSearch, setIsDebouncingSearch] = useState(false);
  const dispatchedSearchRef = useRef("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const debounceFeedbackText =
    searchDebounceText ??
    (onSearchChange && searchDebounceMs > 0
      ? "Aguardando você terminar de digitar..."
      : undefined);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearchValue("");
      dispatchedSearchRef.current = "";
      setIsDebouncingSearch(false);
    }
    onOpenChange?.(next);
  };

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  const filteredOptions = useMemo(
    () => filterAndSortComboboxOptions(options, searchValue),
    [options, searchValue],
  );
  const showDebounceMessage =
    Boolean(debounceFeedbackText) &&
    isDebouncingSearch &&
    searchValue.trim().length >= minSearchLengthForDebounceFeedback;
  const showLoadingSkeleton = isLoading && !showDebounceMessage;

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [searchValue]);

  useEffect(() => {
    if (!onSearchChange || searchDebounceMs <= 0) {
      setIsDebouncingSearch(false);
      return;
    }

    if (searchValue === dispatchedSearchRef.current) {
      setIsDebouncingSearch(false);
      return;
    }

    setIsDebouncingSearch(true);
    const t = setTimeout(() => {
      onSearchChange(searchValue);
      dispatchedSearchRef.current = searchValue;
      setIsDebouncingSearch(false);
    }, searchDebounceMs);
    return () => clearTimeout(t);
  }, [searchValue, onSearchChange, searchDebounceMs]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || isLoadingMore || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  const handleSelect = (selectedValue: string) => {
    const newValue = value === selectedValue ? undefined : selectedValue;
    onValueChange?.(newValue);
    setOpen(false);
  };

  const useAnchorLayout = suffix != null && suffix !== false;

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "w-full justify-between h-9",
        useAnchorLayout
          ? // Em modo âncora o "chrome" (borda/sombra/hover/ring/altura) fica no
            // container para que gatilho + suffix pareçam um único controle.
            // O gatilho estica (h-full) em vez de impor a própria altura, senão
            // somaria a borda do container e o controle ficaria mais alto.
            "h-full rounded-none border-0 bg-transparent pr-0 shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent"
          : value
            ? "pr-0"
            : "rounded-lg",
        !value && "text-muted-foreground",
        // No modo âncora, className (altura/borda/etc.) é aplicado ao container,
        // não ao gatilho — assim a altura não soma com a borda do container.
        !useAnchorLayout && className,
      )}
    >
      <span className="truncate">
        {selectedOption
          ? `${valueLabelPrefix}${selectedOption.label ?? ""}`
          : placeholder}
      </span>

      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : handleOpenChange}
    >
      {useAnchorLayout ? (
        <PopoverAnchor asChild>
          <div
            className={cn(
              "flex w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-sm transition-colors",
              disabled
                ? "opacity-50"
                : "hover:bg-accent/50 focus-within:ring-1 focus-within:ring-ring dark:hover:bg-accent/10",
              className,
              anchorClassName,
            )}
          >
            <div className="min-w-0 flex-1">
              <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            </div>
            {suffix}
          </div>
        </PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      )}
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(event) => {
              if (event.key === "Home" || event.key === "End") {
                event.stopPropagation();
              }
            }}
          />
          <CommandList
            ref={listRef}
            aria-busy={showLoadingSkeleton || showDebounceMessage}
          >
            {showDebounceMessage ? (
              <ComboboxSearchDebounceMessage message={debounceFeedbackText!} />
            ) : showLoadingSkeleton ? (
              <ComboboxOptionsSkeleton rows={loadingSkeletonRows} />
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup key={searchValue || "all"}>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label ?? ""}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label ?? ""}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-2"
              >
                {isLoadingMore && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
