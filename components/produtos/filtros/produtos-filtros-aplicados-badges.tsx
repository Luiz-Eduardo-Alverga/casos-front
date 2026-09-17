"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import type { ProdutosFiltrosAplicados } from "@/components/produtos/filtros/produtos-filtros.types";

interface ProdutosFiltrosAplicadosBadgesProps {
  filtros: ProdutosFiltrosAplicados;
  onRemove: (key: keyof ProdutosFiltrosAplicados) => void;
  onClear: () => void;
}

export function ProdutosFiltrosAplicadosBadges({
  filtros,
  onRemove,
  onClear,
}: ProdutosFiltrosAplicadosBadgesProps) {
  const items = [
    filtros.nome
      ? { key: "nome" as const, label: `${PRODUTO_LABELS.nome}: ${filtros.nome}` }
      : null,
    filtros.setor
      ? { key: "setor" as const, label: `${PRODUTO_LABELS.setor}: ${filtros.setor}` }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Badge
          key={item.key}
          variant="secondary"
          className="gap-2 px-2 py-1 font-normal"
        >
          {item.label}
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={`Remover filtro ${item.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0 text-xs"
        onClick={onClear}
      >
        {PRODUTO_LABELS.limparFiltros}
      </Button>
    </div>
  );
}
