"use client";

import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Destinatario } from "./novo-aviso.types";
import { descricaoUsuario, filtrarPorNome, iniciais } from "./utils";

interface ListaDestinatariosProps {
  lista: Destinatario[];
  excluidos: number[];
  busca: string;
  onBuscaChange: (busca: string) => void;
  onToggle: (registro: number, marcado: boolean) => void;
  /** Marca ou desmarca todos os registros passados (a lista visível). */
  onToggleVarios: (registros: number[], marcado: boolean) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Mensagem quando ainda não há base (nenhum filtro nem usuário adicionado). */
  vazioSemBase?: string | null;
  invalid?: boolean;
}

export function ListaDestinatarios({
  lista,
  excluidos,
  busca,
  onBuscaChange,
  onToggle,
  onToggleVarios,
  isLoading,
  isError,
  onRetry,
  vazioSemBase,
  invalid,
}: ListaDestinatariosProps) {
  const fora = new Set(excluidos);
  const visiveis = filtrarPorNome(lista, busca);
  const totalMarcados = lista.filter((u) => !fora.has(u.registro)).length;
  const visiveisMarcados = visiveis.filter((u) => !fora.has(u.registro)).length;
  const mestre: boolean | "indeterminate" =
    visiveis.length === 0 || visiveisMarcados === 0
      ? false
      : visiveisMarcados === visiveis.length
        ? true
        : "indeterminate";

  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col overflow-hidden rounded-lg border border-border-input lg:min-h-0 lg:flex-1",
        invalid && "border-text-error",
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-border-divider bg-muted px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Checkbox
            checked={mestre}
            disabled={isLoading || visiveis.length === 0}
            onCheckedChange={(v) =>
              onToggleVarios(
                visiveis.map((u) => u.registro),
                v === true,
              )
            }
            aria-label="Selecionar todos os usuários visíveis"
          />
          {totalMarcados} de {lista.length} usuários selecionados
        </label>
        <div className="relative sm:w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <Input
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar usuário..."
            className="h-8 bg-card pl-8 text-sm"
            aria-label="Buscar usuário na lista"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <ListaDestinatariosSkeleton />
        ) : isError ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm text-text-secondary">
              Não foi possível carregar os usuários.
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar de novo
            </Button>
          </div>
        ) : lista.length === 0 || visiveis.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Users className="h-4 w-4 text-text-secondary" />
            </div>
            <p className="text-sm text-text-secondary">
              {lista.length === 0
                ? (vazioSemBase ?? "Nenhum usuário encontrado com esses filtros.")
                : "Nenhum usuário com esse nome entre os filtrados."}
            </p>
          </div>
        ) : (
          <ul>
            {visiveis.map((u) => {
              const marcado = !fora.has(u.registro);
              return (
                <li
                  key={u.registro}
                  className="border-b border-border-divider last:border-b-0"
                >
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-table-row-hover">
                    <Checkbox
                      checked={marcado}
                      onCheckedChange={(v) => onToggle(u.registro, v === true)}
                      aria-label={`Selecionar ${u.nome_suporte}`}
                    />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-badge-open-bg text-xs font-semibold text-panel-badge-open">
                      {iniciais(u.nome_suporte)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text-primary">
                          {u.nome_suporte}
                        </span>
                        {u.adicionado ? (
                          <Badge className="rounded-full border-0 bg-panel-badge-fixed-bg px-2 py-0 text-xs font-semibold text-panel-badge-fixed hover:bg-panel-badge-fixed-bg">
                            Adicionado
                          </Badge>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-text-secondary">
                        {descricaoUsuario(u)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-text-secondary">
                      #{u.registro}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ListaDestinatariosSkeleton() {
  return (
    <ul aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-b border-border-divider px-4 py-2 last:border-b-0"
        >
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-10" />
        </li>
      ))}
    </ul>
  );
}
