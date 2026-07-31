"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/painel/empty-state";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import {
  CASE_ID_MAX_LENGTH,
  CASE_SEARCH_DEBOUNCE_MS,
  formatCaseSearchValue,
  isCaseSearchReady,
} from "@/components/caso-search-modal/utils";

interface CasoSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CasoSearchModal({ open, onOpenChange }: CasoSearchModalProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const allowAutoNavigateRef = useRef(false);
  const debouncedSearch = useDebouncedValue(
    searchInput,
    CASE_SEARCH_DEBOUNCE_MS,
  );

  const navigateToCaso = useCallback(
    (caseId: string) => {
      if (!isCaseSearchReady(caseId)) return;
      allowAutoNavigateRef.current = false;
      setSearchInput("");
      onOpenChange(false);
      router.push(`/casos/${caseId}`);
    },
    [onOpenChange, router],
  );

  const isSearchPending =
    isCaseSearchReady(searchInput) && searchInput !== debouncedSearch;

  useEffect(() => {
    if (open) return;

    allowAutoNavigateRef.current = false;
    setSearchInput("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!allowAutoNavigateRef.current) return;
    if (debouncedSearch !== searchInput) return;
    if (!isCaseSearchReady(debouncedSearch)) return;

    navigateToCaso(debouncedSearch);
  }, [open, debouncedSearch, searchInput, navigateToCaso]);

  const handleSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      if (!isCaseSearchReady(searchInput)) return;

      e.preventDefault();
      navigateToCaso(searchInput);
    },
    [searchInput, navigateToCaso],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Pesquisar caso</DialogTitle>
      <DialogContent className="max-h-[90vh] max-w-[580px] min-w-0 overflow-hidden p-0">
        <div className="bg-card rounded-lg">
          <div className="px-6 pt-8 pb-4 shrink-0 bg-card">
            <Input
              value={searchInput}
              onChange={(e) => {
                allowAutoNavigateRef.current = true;
                setSearchInput(formatCaseSearchValue(e.target.value));
              }}
              onKeyDown={handleSearchInputKeyDown}
              maxLength={CASE_ID_MAX_LENGTH}
              inputMode="numeric"
              placeholder="Digite o número do caso (mín. 5 dígitos)"
              autoFocus
            />
          </div>

          {isSearchPending ? (
            <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 px-6 pb-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Abrindo caso…</p>
            </div>
          ) : (
            <div className="flex-1 px-6 pb-6">
              <EmptyState
                imageSrc="/images/empty-state-casos-produto.svg"
                title="Pesquise um caso"
                description="Digite o número do caso (mínimo 5 dígitos) para abrir a edição automaticamente."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
