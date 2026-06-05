"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { useStatus } from "@/hooks/catalogos/use-status";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import { useUsuarios } from "@/hooks/catalogos/use-usuarios";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { cn } from "@/lib/utils";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import {
  buildCasosFiltrosBadgeItems,
  MAX_CASOS_FILTROS_BADGES_VISIVEIS,
  removeFilterFromAplicados,
  type CasosFiltroBadgeKey,
} from "@/components/casos/filtros/casos-filtros-badge-labels";

interface CasosFiltrosAplicadosBadgesProps {
  filtrosAplicados: CasosFiltrosAplicados;
  onAplicar: (filtros: CasosFiltrosAplicados) => void;
  className?: string;
}

export function CasosFiltrosAplicadosBadges({
  filtrosAplicados,
  onAplicar,
  className,
}: CasosFiltrosAplicadosBadgesProps) {
  const reduceMotion = useReducedMotion();
  const { data: produtos = [] } = useProdutos();
  const { data: statusList = [] } = useStatus();
  const { data: categorias = [] } = useCategorias();
  const { data: usuarios = [] } = useUsuarios();
  const produtoFiltro = filtrosAplicados.produto?.trim() ?? "";
  const { data: versoes = [] } = useVersoes({
    produto_id: produtoFiltro,
    enabled:
      Boolean(produtoFiltro) && Boolean(filtrosAplicados.versao?.trim()),
    todas: false,
  });

  const allItems = useMemo(
    () =>
      buildCasosFiltrosBadgeItems(filtrosAplicados, {
        produtos,
        statusList,
        categorias,
        usuarios,
        versoes,
      }),
    [filtrosAplicados, produtos, statusList, categorias, usuarios, versoes],
  );

  const visibleItems = allItems.slice(0, MAX_CASOS_FILTROS_BADGES_VISIVEIS);
  const overflowCount = Math.max(
    0,
    allItems.length - MAX_CASOS_FILTROS_BADGES_VISIVEIS,
  );

  const handleRemove = (key: CasosFiltroBadgeKey) => {
    onAplicar(removeFilterFromAplicados(filtrosAplicados, key));
  };

  if (allItems.length === 0) {
    return null;
  }

  const wrapperClassName = cn("flex flex-wrap items-center gap-2", className);

  if (reduceMotion) {
    return (
      <div className={wrapperClassName}>
        {visibleItems.map((item) => (
          <BadgeChip
            key={item.key}
            label={item.label}
            onRemove={() => handleRemove(item.key)}
          />
        ))}
        {overflowCount > 0 ? (
          <span
            className={cn(
              "inline-flex h-7 items-center rounded-[10px] bg-amber-100 px-3",
              "text-xs font-semibold text-amber-800",
            )}
          >
            +{overflowCount} Filtros ativos
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <motion.div layout className={wrapperClassName}>
      <AnimatePresence initial={false} mode="popLayout">
        {visibleItems.map((item) => (
          <motion.div
            key={item.key}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="inline-flex"
          >
            <BadgeChip
              label={item.label}
              onRemove={() => handleRemove(item.key)}
            />
          </motion.div>
        ))}
        {overflowCount > 0 ? (
          <motion.span
            key="overflow"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className={cn(
              "inline-flex h-7 items-center rounded-[10px] bg-amber-100 px-3",
              "text-xs font-semibold text-amber-800",
            )}
          >
            +{overflowCount} Filtros ativos
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function BadgeChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-[220px] items-center gap-2 rounded-[10px] bg-blue-100 px-2 py-1",
        "text-[11px] font-semibold text-blue-800",
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-sm p-0.5 text-blue-800 hover:bg-blue-200/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}
