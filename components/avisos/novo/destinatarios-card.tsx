"use client";

import type { ReactNode } from "react";
import { FilterX, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ModoDestinatarios } from "./novo-aviso.types";
import { rotuloDestinatarios } from "./utils";

interface DestinatariosCardProps {
  modo: ModoDestinatarios;
  onModoChange: (modo: ModoDestinatarios) => void;
  /** Total da empresa (modo Todos); null enquanto carrega ou com erro. */
  totalEmpresa: number | null;
  selecionados: number;
  mostrarLimparFiltros: boolean;
  onLimparFiltros: () => void;
  disabled?: boolean;
  /** Filtros, "Adicionar usuário específico" e lista, na ordem. */
  children: ReactNode;
  erro?: string | null;
}

export function DestinatariosCard({
  modo,
  onModoChange,
  totalEmpresa,
  selecionados,
  mostrarLimparFiltros,
  onLimparFiltros,
  disabled,
  children,
  erro,
}: DestinatariosCardProps) {
  return (
    <Card className="flex min-w-0 flex-col rounded-lg bg-card shadow-card lg:min-h-0 lg:flex-[2]">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              2 · Destinatários
            </CardTitle>
            <span className="whitespace-nowrap rounded-full bg-panel-badge-open-bg px-2 py-0.5 text-xs font-semibold text-panel-badge-open">
              {rotuloDestinatarios(selecionados)}
            </span>
          </div>
          {mostrarLimparFiltros ? (
            <button
              type="button"
              onClick={onLimparFiltros}
              disabled={disabled}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-status-info hover:underline disabled:opacity-50"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpar filtros
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-6 pt-4">
        <div
          role="radiogroup"
          aria-label="Quem recebe o aviso"
          className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <ModoCard
            selecionado={modo === "todos"}
            onSelect={() => onModoChange("todos")}
            disabled={disabled}
            titulo="Todos os usuários"
            descricao={
              totalEmpresa === null
                ? "Envia para toda a empresa"
                : `Envia para toda a empresa (${totalEmpresa} usuários)`
            }
          />
          <ModoCard
            selecionado={modo === "filtrar"}
            onSelect={() => onModoChange("filtrar")}
            disabled={disabled}
            titulo="Filtrar destinatários"
            descricao="Escolha por PDV, setor, nível e função"
          />
        </div>

        {children}

        {erro ? <p className="shrink-0 text-xs text-text-error">{erro}</p> : null}
      </CardContent>
    </Card>
  );
}

function ModoCard({
  selecionado,
  onSelect,
  disabled,
  titulo,
  descricao,
}: {
  selecionado: boolean;
  onSelect: () => void;
  disabled?: boolean;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionado}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-2 rounded-lg border p-4 text-left transition-colors disabled:opacity-50",
        selecionado
          ? "border-primary bg-primary/5"
          : "border-border-input hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selecionado ? "border-primary" : "border-border-strong",
        )}
      >
        {selecionado ? (
          <span className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-primary">
          {titulo}
        </span>
        <span className="block text-xs text-text-secondary">{descricao}</span>
      </span>
    </button>
  );
}
