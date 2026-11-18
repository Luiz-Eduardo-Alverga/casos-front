"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { resumoFiltro } from "./utils";

/** Acima disso o popover ganha busca. */
const LIMITE_SEM_BUSCA = 8;

interface FiltroMultiSelectProps {
  id: string;
  label: string;
  opcoes: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function FiltroMultiSelect({
  id,
  label,
  opcoes,
  value,
  onChange,
  disabled,
}: FiltroMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const marcados = new Set(value);
  const comBusca = opcoes.length > LIMITE_SEM_BUSCA;

  const toggle = (opcao: string) => {
    onChange(
      marcados.has(opcao)
        ? value.filter((v) => v !== opcao)
        : opcoes.filter((o) => o === opcao || marcados.has(o)),
    );
  };

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="text-text-label">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border-input bg-card px-3 text-left text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              value.length === 0 ? "text-text-secondary" : "text-text-primary",
            )}
          >
            <span className="truncate">{resumoFiltro(value)}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-text-secondary" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] min-w-[220px] p-0"
        >
          <Command>
            {comBusca ? (
              <CommandInput placeholder={`Buscar ${label}...`} />
            ) : null}
            <div className="flex items-center justify-between border-b border-border-divider px-3 py-2 text-xs font-semibold">
              <button
                type="button"
                className="text-status-info hover:underline"
                onClick={() => onChange([...opcoes])}
              >
                Selecionar todos
              </button>
              <button
                type="button"
                className="text-text-secondary hover:underline"
                onClick={() => onChange([])}
              >
                Limpar
              </button>
            </div>
            <CommandList className="max-h-[260px]">
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                {opcoes.map((opcao) => {
                  const marcado = marcados.has(opcao);
                  return (
                    <CommandItem
                      key={opcao}
                      value={opcao}
                      onSelect={() => toggle(opcao)}
                      className="gap-2"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                          marcado && "bg-primary text-primary-foreground",
                        )}
                        aria-hidden
                      >
                        {marcado ? <Check className="h-3 w-3" /> : null}
                      </span>
                      {opcao}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
