"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MESES_LONGOS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function chaveMes(ano: number, mesIndex: number): string {
  return `${ano}-${String(mesIndex + 1).padStart(2, "0")}`;
}

function lerMes(valor: string): { ano: number; mesIndex: number } | null {
  const match = valor.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return null;
  return { ano: Number(match[1]), mesIndex: Number(match[2]) - 1 };
}

/** "2026-11" → "Novembro de 2026". */
export function formatarMes(valor: string): string {
  const mes = lerMes(valor);
  return mes ? `${MESES_LONGOS[mes.mesIndex]} de ${mes.ano}` : "";
}

export interface MesPickerProps {
  /** Mês `AAAA-MM`; "" = nenhum mês (Todos os meses). */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  /** Texto quando não há mês escolhido. */
  placeholder?: string;
  /** Texto do botão que limpa a escolha. */
  labelTodos?: string;
  className?: string;
}

/**
 * Seletor só de mês (ano com setas + grade de 12 meses), genérico para telas mensais.
 * Mês escolhido com fundo primário; mês atual com contorno.
 */
export function MesPicker({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = "Todos os meses",
  labelTodos = "Todos os meses",
  className,
}: MesPickerProps) {
  const hoje = new Date();
  const mesAtual = chaveMes(hoje.getFullYear(), hoje.getMonth());
  const selecionado = lerMes(value);
  const [open, setOpen] = useState(false);
  const [anoVisivel, setAnoVisivel] = useState(selecionado?.ano ?? hoje.getFullYear());

  const escolher = (valor: string) => {
    onChange(valor);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(proximo) => {
        if (proximo) setAnoVisivel(lerMes(value)?.ano ?? new Date().getFullYear());
        setOpen(proximo);
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          // Mesmo visual do SelectTrigger (borda, sombra, fundo transparente e anel de foco).
          className={cn(
            "flex h-9 w-full items-center gap-2 whitespace-nowrap rounded-lg border border-input bg-transparent px-3 text-left text-sm shadow-sm",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              !selecionado && "text-muted-foreground",
            )}
          >
            {selecionado ? formatarMes(value) : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[264px] p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Ano anterior"
            onClick={() => setAnoVisivel((a) => a - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-text-primary">{anoVisivel}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Próximo ano"
            onClick={() => setAnoVisivel((a) => a + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MESES_CURTOS.map((curto, mesIndex) => {
            const chave = chaveMes(anoVisivel, mesIndex);
            const ativo = value === chave;
            const atual = mesAtual === chave;
            return (
              <button
                key={chave}
                type="button"
                aria-label={`${MESES_LONGOS[mesIndex]} de ${anoVisivel}`}
                aria-pressed={ativo}
                onClick={() => escolher(chave)}
                className={cn(
                  "h-9 rounded-md border text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ativo
                    ? "border-primary bg-primary text-primary-foreground"
                    : cn(
                        "bg-background text-text-primary hover:bg-muted",
                        atual ? "border-primary" : "border-transparent",
                      ),
                )}
              >
                {curto}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border-divider pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => escolher(mesAtual)}
          >
            Este mês
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-text-secondary"
            onClick={() => escolher("")}
          >
            {labelTodos}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
