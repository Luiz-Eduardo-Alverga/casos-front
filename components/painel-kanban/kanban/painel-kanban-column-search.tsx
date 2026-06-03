"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SEARCH_TRANSITION = { duration: 0.2, ease: "easeInOut" } as const;
const SEARCH_FOCUS_DELAY_MS = SEARCH_TRANSITION.duration * 1000 + 20;

const inputClassName =
  "h-8 min-w-0 flex-1 text-xs focus-visible:ring-inset focus-visible:ring-offset-0";

interface PainelKanbanColumnSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PainelKanbanColumnSearch({
  value,
  onChange,
  className,
}: PainelKanbanColumnSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const focusInput = () => {
    requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(focusInput, SEARCH_FOCUS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    onChange("");
    setOpen(false);
  };

  if (reduceMotion) {
    if (!open) {
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", className)}
          onClick={handleOpen}
          aria-label="Buscar casos na coluna"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
      );
    }

    return (
      <div className={cn("flex min-w-0 flex-1 items-center gap-1", className)}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por descrição..."
          className={inputClassName}
          clearable={false}
          aria-label="Buscar por descrição do caso"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleClose}
          aria-label="Fechar busca"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 shrink-0 items-center justify-end overflow-visible",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="trigger"
            className="flex shrink-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={SEARCH_TRANSITION}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleOpen}
              aria-label="Buscar casos na coluna"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="search"
            className="flex w-full min-w-0 items-center gap-1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={SEARCH_TRANSITION}
            onAnimationComplete={() => {
              if (open) focusInput();
            }}
          >
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar por descrição..."
              className={inputClassName}
              clearable={false}
              aria-label="Buscar por descrição do caso"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClose}
              aria-label="Fechar busca"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function matchesKanbanColumnSearch(
  descricao: string,
  name: string,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${descricao || name}`.toLowerCase();
  return haystack.includes(q);
}
